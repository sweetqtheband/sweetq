import { ExpenseType, ExpenseStatus } from "./finances";

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
