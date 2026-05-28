import { FinanceConfig as FinanceConfigType } from "@/types/financeConfig";

type FinanceConfig = FinanceConfigType;

export const FinanceConfig = (data: any): FinanceConfig => {
  const obj = {
    coreReservationPercentage: Number(data.coreReservationPercentage) || 30,
    equalSharePercentage: Number(data.equalSharePercentage) || 50,
    variableSharePercentage: Number(data.variableSharePercentage) || 50,
  } as FinanceConfig;

  if (data._id) {
    obj._id = String(data._id);
  }

  return obj;
};
