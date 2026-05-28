import { ExpenseStatus } from "./finances";

export type ExpensePayments = {
  _id: string;
  expenseId: string;
  userId: string;
  amountDue: number;
  status: ExpenseStatus;
  createdAt: Date;
  updatedAt: Date;
};
