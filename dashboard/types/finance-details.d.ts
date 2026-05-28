/**
 * Finance Module Detail Types
 */

import { Expenses, ExpensePayments, ExpensePaymentRecord, Incomes } from "./finance-entities";
import { ExpenseStatus } from "./finance-enums";

export type ExpensePaymentDetail = {
  userId: string;
  userName: string;
  amountDue: number;
  amountPaid: number;
  amountPending: number;
  status: ExpenseStatus;
  paidRecords: ExpensePaymentRecord[];
};

export type ExpenseDetail = Expenses & {
  payments: ExpensePayments[];
  paymentRecords: ExpensePaymentRecord[];
  paymentDetails: ExpensePaymentDetail[];
  totalPaid: number;
  totalPending: number;
};

export type FinanceSummary = {
  totalExpenses: number;
  totalIncomes: number;
  balance: number;
  userBalances: Record<string, number>;
  expenses: Expenses[];
  incomes: Incomes[];
};

export type UserBalance = {
  userId: string;
  userName: string;
  totalDebt: number;
  totalCredit: number;
  balance: number;
  pendingPayments: ExpensePayments[];
};
