import axios from "./_db";
import { POST, GET } from "./_api";
import { CreatePaymentRecordRequest } from "@/types/finances";

const client = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URI}/finance`,
});

/**
 * Finance Payments Service
 * Handles payment registration and related finance operations
 */
export const FinancePayments = {
  /**
   * Register a payment for an expense
   */
  registerPayment: async (expenseId: string, data: CreatePaymentRecordRequest) => {
    return POST(client, data, `/expenses/${expenseId}/payment-records`);
  },

  /**
   * Get income distribution
   */
  getDistribution: async (incomeId: string) => {
    return GET(client, `/incomes/${incomeId}/distribution`, {});
  },

  /**
   * Get all distributions for multiple incomes
   */
  getDistributions: async (incomeIds: string[]) => {
    const results = await Promise.all(
      incomeIds.map((id) => FinancePayments.getDistribution(id).catch(() => null))
    );
    return results.filter((d) => d !== null);
  },
};
