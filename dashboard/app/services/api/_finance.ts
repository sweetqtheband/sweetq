import { getCollection } from "./_db";
import { Expenses } from "@/types/expense";
import { ExpensePayments } from "@/types/expensePayment";
import { ExpensePaymentRecord } from "@/types/expensePaymentRecord";
import { Incomes } from "@/types/income";
import { IncomeDistribution } from "@/types/incomeDistribution";
import { FinanceUsers } from "@/types/finances";
import { ExpenseStatus, UserFinanceType } from "@/types/finances";
import { ObjectId } from "mongodb";

/**
 * Servicio de Finanzas - Maneja BD y lógica de cálculos
 */

// ============ EXPENSES ============

export const createExpense = async (expenseData: any): Promise<Expenses> => {
  const col = await getCollection("expenses");
  const expense = {
    ...expenseData,
    _id: new ObjectId(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await col.insertOne(expense);
  return {
    ...expense,
    _id: expense._id.toString(),
  };
};

export const getExpenses = async (filters: any = {}): Promise<Expenses[]> => {
  const col = await getCollection("expenses");
  const expenses = await col.find(filters).toArray();
  return expenses.map((expense: any) => ({
    ...expense,
    _id: expense._id.toString(),
  })) as unknown as Expenses[];
};

export const getExpenseById = async (id: string): Promise<Expenses | null> => {
  const col = await getCollection("expenses");
  const expense = await col.findOne({ _id: new ObjectId(id) });
  if (!expense) return null;
  return {
    ...expense,
    _id: expense._id.toString(),
  } as unknown as Expenses;
};

export const updateExpense = async (id: string, data: any): Promise<void> => {
  const col = await getCollection("expenses");
  data.updatedAt = new Date();
  await col.updateOne({ _id: new ObjectId(id) }, { $set: data });
};

export const deleteExpense = async (id: string): Promise<void> => {
  const col = await getCollection("expenses");
  await col.deleteOne({ _id: new ObjectId(id) });
  // Limpiar payments relacionados
  const paymentsCol = await getCollection("expensePayments");
  await paymentsCol.deleteMany({ expenseId: id });
};

// ============ EXPENSE PAYMENTS (Obligaciones) ============

export const createExpensePayment = async (paymentData: any): Promise<ExpensePayments> => {
  const col = await getCollection("expensePayments");
  const payment = {
    ...paymentData,
    _id: new ObjectId(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await col.insertOne(payment);
  return {
    ...payment,
    _id: payment._id.toString(),
  };
};

export const getExpensePayments = async (expenseId: string): Promise<ExpensePayments[]> => {
  const col = await getCollection("expensePayments");
  const payments = await col.find({ expenseId }).toArray();
  return payments.map((payment: any) => ({
    ...payment,
    _id: payment._id.toString(),
  })) as unknown as ExpensePayments[];
};

export const updateExpensePaymentStatus = async (
  paymentId: string,
  status: ExpenseStatus
): Promise<void> => {
  const col = await getCollection("expensePayments");
  col.updateOne(
    { _id: new ObjectId(paymentId) },
    {
      $set: {
        status,
        updatedAt: new Date(),
      },
    }
  );
};

// ============ EXPENSE PAYMENT RECORDS (Pagos Reales) ============

export const createPaymentRecord = async (recordData: any): Promise<ExpensePaymentRecord> => {
  const col = await getCollection("expensePaymentRecords");
  const record = {
    ...recordData,
    _id: new ObjectId(),
    createdAt: new Date(),
  };
  await col.insertOne(record);
  return {
    ...record,
    _id: record._id.toString(),
  };
};

export const getPaymentRecords = async (expenseId: string): Promise<ExpensePaymentRecord[]> => {
  const col = await getCollection("expensePaymentRecords");
  const records = await col.find({ expenseId }).toArray();
  return records.map((record: any) => ({
    ...record,
    _id: record._id.toString(),
  })) as unknown as ExpensePaymentRecord[];
};

export const getPaymentsByUser = async (
  expenseId: string,
  userId: string
): Promise<ExpensePaymentRecord[]> => {
  const col = await getCollection("expensePaymentRecords");
  const records = await col.find({ expenseId, paidBy: userId }).toArray();
  return records.map((record: any) => ({
    ...record,
    _id: record._id.toString(),
  })) as unknown as ExpensePaymentRecord[];
};

// ============ INCOMES ============

export const createIncome = async (incomeData: any): Promise<Incomes> => {
  const col = await getCollection("incomes");
  const income = {
    ...incomeData,
    _id: new ObjectId(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await col.insertOne(income);
  return {
    ...income,
    _id: income._id.toString(),
  };
};

export const getIncomes = async (filters: any = {}): Promise<Incomes[]> => {
  const col = await getCollection("incomes");
  const incomes = await col.find(filters).toArray();
  return incomes.map((income: any) => ({
    ...income,
    _id: income._id.toString(),
  })) as unknown as Incomes[];
};

export const getIncomeById = async (id: string): Promise<Incomes | null> => {
  const col = await getCollection("incomes");
  const income = await col.findOne({ _id: new ObjectId(id) });
  if (!income) return null;
  return {
    ...income,
    _id: income._id.toString(),
  } as unknown as Incomes;
};

export const updateIncome = async (id: string, data: any): Promise<void> => {
  const col = await getCollection("incomes");
  data.updatedAt = new Date();
  await col.updateOne({ _id: new ObjectId(id) }, { $set: data });
};

export const deleteIncome = async (id: string): Promise<void> => {
  const col = await getCollection("incomes");
  await col.deleteOne({ _id: new ObjectId(id) });
};

// ============ INCOME DISTRIBUTION (Lógica 3-Fases) ============

/**
 * Calcula la distribución automática de ingresos
 * FASE 1: Cubre deudas pendientes
 * FASE 2: Reserva 30% para gastos núcleo
 * FASE 3: Reparte 70% (50% igual + 50% variable)
 */
export const calculateIncomeDistribution = async (
  incomeId: string,
  income: Incomes
): Promise<any> => {
  // Obtener configuración
  const configCol = await getCollection("financeConfig");
  const config = (await configCol.findOne({})) || {
    coreReservationPercentage: 30,
    equalSharePercentage: 50,
    variableSharePercentage: 50,
  };

  // Obtener todos los gastos del concepto
  const expensesCol = await getCollection("expenses");
  const conceptExpenses = await expensesCol.find({ concept: income.concept }).toArray();

  // Obtener usuarios
  const usersCol = await getCollection("financeUsers");
  const users = await usersCol.find({}).toArray();

  // ===== FASE 1: Cubrir deudas =====
  let debtCovered = 0;
  let operationalExpenseCovered = 0;
  const debtByUser: Record<string, number> = {};

  for (const expense of conceptExpenses) {
    const expenseId = (expense._id as any).toString();
    const payments = await getExpensePayments(expenseId);
    const paymentRecords = await getPaymentRecords(expenseId);

    for (const payment of payments) {
      const paid = paymentRecords
        .filter((r) => r.paidBy === payment.userId)
        .reduce((sum, r) => sum + r.amount, 0);

      const pending = payment.amountDue - paid;

      if (pending > 0) {
        if (expense.type === "operational") {
          operationalExpenseCovered += Math.min(pending, income.amount);
        } else {
          debtCovered += Math.min(pending, income.amount);
        }

        debtByUser[payment.userId] = (debtByUser[payment.userId] || 0) + pending;
      }
    }
  }

  const totalDebtToCover = debtCovered + operationalExpenseCovered;
  const incomeAfterDebt = Math.max(0, income.amount - totalDebtToCover);

  // ===== FASE 2: Reserva para gastos núcleo =====
  const coreReservationAmount = incomeAfterDebt * (config.coreReservationPercentage / 100);

  const totalCoreDebt = Object.entries(debtByUser)
    .filter(([userId]) => {
      const user = users.find((u) => (u._id as any).toString() === userId);
      return user?.memberType === UserFinanceType.CORE || user;
    })
    .reduce((sum, [_, amount]) => sum + amount, 0);

  const coreReservationByUser: Record<string, number> = {};

  for (const [userId, amount] of Object.entries(debtByUser)) {
    if (totalCoreDebt > 0) {
      coreReservationByUser[userId] = (amount / totalCoreDebt) * coreReservationAmount;
    }
  }

  // ===== FASE 3: Beneficio neto (70%) =====
  const netBenefitAmount = incomeAfterDebt * (70 / 100);
  const equalSharePercentage = config.equalSharePercentage / 100;
  const variableSharePercentage = config.variableSharePercentage / 100;

  const equalShareAmount = netBenefitAmount * equalSharePercentage * 0.5;
  const variableShareAmount = netBenefitAmount * variableSharePercentage * 0.5;

  const equalSharePerPerson = users.length > 0 ? equalShareAmount / users.length : 0;

  const variableShareByUser: Record<string, number> = {};
  const totalPercentage = users.reduce((sum, u) => sum + u.percentage, 0);

  for (const user of users) {
    const sharePercentage = totalPercentage > 0 ? user.percentage / totalPercentage : 0;
    variableShareByUser[(user._id as any).toString()] = variableShareAmount * sharePercentage;
  }

  // ===== Consolidar por usuario =====
  const distributionByUser: Record<string, any> = {};

  for (const user of users) {
    const userId = String(user._id);

    distributionByUser[userId] = {
      userId,
      userName: user.name,
      debtCoverage: debtByUser[userId] || 0,
      coreReservation: coreReservationByUser[userId] || 0,
      equalShare: equalSharePerPerson,
      variableShare: variableShareByUser[userId] || 0,
      total:
        (debtByUser[userId] || 0) +
        (coreReservationByUser[userId] || 0) +
        equalSharePerPerson +
        (variableShareByUser[userId] || 0),
    };
  }

  const distribution: IncomeDistribution = {
    _id: new ObjectId().toString(),
    incomeId,
    concept: income.concept,
    distributionDate: new Date(),
    debtCovered,
    operationalExpenseCovered,
    coreReservationPercentage: config.coreReservationPercentage,
    coreReservationAmount,
    coreReservationByUser,
    netBenefitAmount,
    equalSharePercentage: config.equalSharePercentage,
    variableSharePercentage: config.variableSharePercentage,
    distributionByUser,
    createdAt: new Date(),
  };

  // Guardar distribución
  const distCol = await getCollection("incomeDistributions");
  await distCol.insertOne(distribution as any);

  return distribution;
};

export const getIncomeDistribution = async (incomeId: string): Promise<any | null> => {
  const col = await getCollection("incomeDistributions");
  const distribution = await col.findOne({ incomeId });
  if (!distribution) return null;
  return {
    ...distribution,
    _id: distribution._id.toString(),
  };
};
