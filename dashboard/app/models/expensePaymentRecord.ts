import { ExpensePaymentRecord as ExpensePaymentRecordType } from "@/types/expensePaymentRecord";

type ExpensePaymentRecord = ExpensePaymentRecordType;

export const ExpensePaymentRecord = (data: any): ExpensePaymentRecord => {
  const obj = {
    amount: Number(data.amount) || 0,
    paymentDate: new Date(data.paymentDate) || new Date(),
    paidTo: data.paidTo ? String(data.paidTo) : null,
  } as ExpensePaymentRecord;

  if (data._id) {
    obj._id = String(data._id);
  }

  if (data.expenseId) {
    obj.expenseId = String(data.expenseId);
  }

  if (data.paidBy) {
    obj.paidBy = String(data.paidBy);
  }

  return obj;
};
