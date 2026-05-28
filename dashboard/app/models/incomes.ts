import { Incomes as IncomesType } from "@/types/income";

type Incomes = IncomesType;

export const Incomes = (data: any): Incomes => {
  const obj = {
    amount: Number(data.amount) || 0,
    receivedAt: new Date(data.receivedAt) || new Date(),
  } as Incomes;

  if (data._id) {
    obj._id = String(data._id);
  }

  if (data.name) {
    obj.name = String(data.name);
  }

  if (data.concept) {
    obj.concept = String(data.concept);
  }

  if (data.source) {
    obj.source = String(data.source);
  }

  if (data.description) {
    obj.description = String(data.description);
  }

  if (data.valueDate) {
    obj.valueDate = new Date(data.valueDate);
  } else {
    obj.valueDate = null;
  }

  return obj;
};
