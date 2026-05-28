/**
 * Finance Module Constants
 */

export const FINANCE_PANEL_ACTIONS = {
  CREATE_EXPENSE: "CREATE_EXPENSE",
  CREATE_INCOME: "CREATE_INCOME",
  PAYMENT: "PAYMENT",
} as const;

export type FinancePanelAction = (typeof FINANCE_PANEL_ACTIONS)[keyof typeof FINANCE_PANEL_ACTIONS];
