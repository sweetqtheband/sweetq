export type IncomeDistribution = {
  _id: string;
  incomeId: string;
  concept: string;
  distributionDate: Date;
  debtCovered: number;
  operationalExpenseCovered: number;
  coreReservationPercentage: number;
  coreReservationAmount: number;
  coreReservationByUser: Record<string, number>;
  netBenefitAmount: number;
  equalSharePercentage: number;
  variableSharePercentage: number;
  distributionByUser: Record<
    string,
    {
      userId: string;
      userName: string;
      debtCoverage: number;
      coreReservation: number;
      equalShare: number;
      variableShare: number;
      total: number;
    }
  >;
  createdAt: Date;
};
