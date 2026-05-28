/**
 * Enumerations for Finance Module
 */

export enum UserFinanceType {
  CORE = "core",
  OPERATIVE = "operative",
}

export enum ExpenseType {
  OPERATIONAL = "operational",
  CORE = "core",
}

export enum ExpenseStatus {
  PENDING = "pending",
  PARTIAL = "partial",
  PAID = "paid",
}

/**
 * Finance Users Type
 */
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

/**
 * Finance Requests & Responses
 */
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
