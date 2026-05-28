/**
 * Finance Module Entities
 */

import { UserFinanceType, ExpenseType, ExpenseStatus } from "./finance-enums";

export type FinanceUsers = {
  _id: string;
  name: string;
  userId: string | null;
  percentage: number;
  ordering: number;
  memberType: UserFinanceType;
  createdAt: Date;
  updatedAt: Date;
};

export type Expenses = {
  _id: string;
  name: string;
  type: ExpenseType;
  concept: string;
  totalAmount: number;
  percentageToCharge: number;
  amountToCharge: number;
  description: string;
  valueDate: Date | null;
  status: ExpenseStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ExpensePayments = {
  _id: string;
  expenseId: string;
  userId: string;
  amountDue: number;
  status: ExpenseStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type ExpensePaymentRecord = {
  _id: string;
  expenseId: string;
  paidBy: string;
  paidTo: string | null;
  amount: number;
  paymentDate: Date;
  createdAt: Date;
};

export type Incomes = {
  _id: string;
  name: string;
  concept: string;
  amount: number;
  source: string;
  description: string;
  valueDate: Date | null;
  receivedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type IncomeDistribution = {
  _id: string;
  incomeId: string;
  concept: string;
  distributionDate: Date;
  debtCovered: number;
  operationalExpenseCovered: number;
  coreReservationPercentage: number;
  coreReservationAmount: number;
  coreReservationByUser: Record<string, number>;
  netBenefitAmount: number;
  equalSharePercentage: number;
  variableSharePercentage: number;
  distributionByUser: Record<
    string,
    {
      userId: string;
      userName: string;
      debtCoverage: number;
      coreReservation: number;
      equalShare: number;
      variableShare: number;
      total: number;
    }
  >;
  createdAt: Date;
};

export type FinanceConfig = {
  _id: string;
  coreReservationPercentage: number;
  equalSharePercentage: number;
  variableSharePercentage: number;
  createdAt: Date;
  updatedAt: Date;
};
