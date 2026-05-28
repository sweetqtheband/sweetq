export type ExpensePaymentRecord = {
  _id: string;
  expenseId: string;
  paidBy: string;
  paidTo: string | null;
  amount: number;
  paymentDate: Date;
  createdAt: Date;
};
