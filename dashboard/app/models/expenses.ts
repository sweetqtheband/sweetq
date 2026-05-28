import { Expenses as ExpensesType } from "@/types/expense";
import { ExpenseType, ExpenseStatus } from "@/types/finances";

type Expenses = ExpensesType;

export const Expenses = (data: any): Expenses => {
  const obj = {
    totalAmount: Number(data.totalAmount) || 0,
    percentageToCharge: Number(data.percentageToCharge) || 0,
    amountToCharge:
      Number(data.amountToCharge) ||
      (Number(data.totalAmount) || 0) * ((Number(data.percentageToCharge) || 0) / 100),
    status: (data.status && String(data.status)) || ExpenseStatus.PENDING,
  } as Expenses;

  if (data._id) {
    obj._id = String(data._id);
  }

  if (data.name) {
    obj.name = String(data.name);
  }

  if (data.type) {
    obj.type = String(data.type) as ExpenseType;
  }

  if (data.concept) {
    obj.concept = String(data.concept);
  }

  if (data.description) {
    obj.description = String(data.description);
  }

  if (data.valueDate) {
    obj.valueDate = new Date(data.valueDate);
  } else {
    obj.valueDate = null;
  }

  if (data.createdBy) {
    obj.createdBy = String(data.createdBy);
  }

  return obj;
};
