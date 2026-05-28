/**
 * Finance Module API Request/Response Types
 */

import { ExpenseType, ExpenseStatus } from "./finance-enums";

export type CreateExpenseRequest = {
  name: string;
  type: ExpenseType;
  concept: string;
  totalAmount: number;
  percentageToCharge: number;
  description?: string;
  valueDate?: Date;
};

export type UpdateExpenseRequest = Partial<CreateExpenseRequest> & { _id?: string };

export type CreateIncomeRequest = {
  name: string;
  concept: string;
  amount: number;
  source: string;
  description?: string;
  valueDate?: Date;
  receivedAt: Date;
};

export type UpdateIncomeRequest = Partial<CreateIncomeRequest> & { _id?: string };

export type CreatePaymentRecordRequest = {
  paidBy: string;
  amount: number;
  paidTo?: string | null;
};
