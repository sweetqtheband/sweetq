import { IncomeDistribution as IncomeDistributionType } from "@/types/incomeDistribution";

type IncomeDistribution = IncomeDistributionType;

export const IncomeDistribution = (data: any): IncomeDistribution => {
  const obj = {
    debtCovered: Number(data.debtCovered) || 0,
    operationalExpenseCovered: Number(data.operationalExpenseCovered) || 0,
    coreReservationPercentage: Number(data.coreReservationPercentage) || 30,
    coreReservationAmount: Number(data.coreReservationAmount) || 0,
    coreReservationByUser: data.coreReservationByUser || {},
    netBenefitAmount: Number(data.netBenefitAmount) || 0,
    equalSharePercentage: Number(data.equalSharePercentage) || 50,
    variableSharePercentage: Number(data.variableSharePercentage) || 50,
    distributionByUser: data.distributionByUser || {},
    distributionDate: new Date(data.distributionDate) || new Date(),
  } as IncomeDistribution;

  if (data._id) {
    obj._id = String(data._id);
  }

  if (data.incomeId) {
    obj.incomeId = String(data.incomeId);
  }

  if (data.concept) {
    obj.concept = String(data.concept);
  }

  return obj;
};
