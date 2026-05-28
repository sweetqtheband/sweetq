import { ExpensePayments as ExpensePaymentsType } from "@/types/expensePayment";
import { ExpenseStatus } from "@/types/finances";

type ExpensePayments = ExpensePaymentsType;

export const ExpensePayments = (data: any): ExpensePayments => {
  const obj = {
    amountDue: Number(data.amountDue) || 0,
    status: String(data.status) || ExpenseStatus.PENDING,
  } as ExpensePayments;

  if (data._id) {
    obj._id = String(data._id);
  }

  if (data.expenseId) {
    obj.expenseId = String(data.expenseId);
  }

  if (data.userId) {
    obj.userId = String(data.userId);
  }

  return obj;
};
