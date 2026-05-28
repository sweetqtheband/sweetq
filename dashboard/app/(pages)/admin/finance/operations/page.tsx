import i18n from "@/app/services/translate";
import FinanceOperationsClient from "./client";
import { ExpenseStatus } from "@/types/finances";
import { getTranslation } from "@/app/services/_list";
import { getTranslations } from "@/app/services/_i18n";
import "./operations.scss";

export default async function FinanceOperationsPage() {
  await i18n.init();

  const actionTranslations = getTranslation(i18n, "actions");
  const baseTranslations = getTranslations(i18n, {
    fields: {
      titles: {
        name: "finance.fields.name",
        type: "finance.fields.type",
        totalAmount: "finance.fields.totalAmount",
        percentageToCharge: "finance.fields.percentageToCharge",
        amountToCharge: "finance.fields.amountToCharge",
        status: "finance.fields.status",
        concept: "finance.fields.concept",
        description: "finance.fields.description",
        valueDate: "finance.fields.valueDate",
      },
      options: {
        type: {
          options: [
            { id: "OPERATIONAL", value: "finance.enums.expenseType.OPERATIONAL" },
            { id: "EXTRAORDINARY", value: "finance.enums.expenseType.EXTRAORDINARY" },
          ],
        },
        status: {
          options: [
            { id: ExpenseStatus.PENDING, value: "finance.enums.expenseStatus.PENDING" },
            { id: ExpenseStatus.PARTIAL, value: "finance.enums.expenseStatus.PARTIAL" },
            { id: ExpenseStatus.PAID, value: "finance.enums.expenseStatus.PAID" },
          ],
        },
      },
    },
  });

  const translations = {
    ...baseTranslations,
    fieldValueLabels: {
      type: {
        OPERATIONAL: i18n.t("finance.enums.expenseType.OPERATIONAL"),
        EXTRAORDINARY: i18n.t("finance.enums.expenseType.EXTRAORDINARY"),
        operational: i18n.t("finance.enums.expenseType.OPERATIONAL"),
        extraordinary: i18n.t("finance.enums.expenseType.EXTRAORDINARY"),
        "finance.enums.expenseType.OPERATIONAL": i18n.t("finance.enums.expenseType.OPERATIONAL"),
        "finance.enums.expenseType.EXTRAORDINARY": i18n.t(
          "finance.enums.expenseType.EXTRAORDINARY"
        ),
      },
      status: {
        [ExpenseStatus.PENDING]: i18n.t("finance.enums.expenseStatus.PENDING"),
        [ExpenseStatus.PARTIAL]: i18n.t("finance.enums.expenseStatus.PARTIAL"),
        [ExpenseStatus.PAID]: i18n.t("finance.enums.expenseStatus.PAID"),
        "finance.enums.expenseStatus.PENDING": i18n.t("finance.enums.expenseStatus.PENDING"),
        "finance.enums.expenseStatus.PARTIAL": i18n.t("finance.enums.expenseStatus.PARTIAL"),
        "finance.enums.expenseStatus.PAID": i18n.t("finance.enums.expenseStatus.PAID"),
      },
    },
    title: i18n.t("finance.title"),
    description: i18n.t("finance.description"),
    sections: i18n.t("finance.sections"),
    tabs: {
      expenses: i18n.t("finance.tabs.expenses"),
      incomes: i18n.t("finance.tabs.incomes"),
      summary: i18n.t("finance.tabs.summary"),
    },
    buttons: {
      newExpense: i18n.t("finance.buttons.newExpense"),
      newIncome: i18n.t("finance.buttons.newIncome"),
      edit: i18n.t("finance.buttons.edit"),
      delete: i18n.t("finance.buttons.delete"),
      viewDistribution: i18n.t("finance.buttons.viewDistribution"),
      createExpense: i18n.t("finance.buttons.createExpense"),
      createIncome: i18n.t("finance.buttons.createIncome"),
      registerPayment: i18n.t("finance.buttons.registerPayment"),
      detail: i18n.t("finance.buttons.detail"),
    },
    messages: {
      loading: i18n.t("finance.messages.loading"),
      deleteExpenseConfirm: i18n.t("finance.messages.deleteExpenseConfirm"),
      deleteIncomeConfirm: i18n.t("finance.messages.deleteIncomeConfirm"),
      distributionNotCalculated: i18n.t("finance.messages.distributionNotCalculated"),
    },
    errors: {
      createExpense: i18n.t("finance.errors.createExpense"),
      updateExpense: i18n.t("finance.errors.updateExpense"),
      deleteExpense: i18n.t("finance.errors.deleteExpense"),
      createIncome: i18n.t("finance.errors.createIncome"),
      updateIncome: i18n.t("finance.errors.updateIncome"),
      deleteIncome: i18n.t("finance.errors.deleteIncome"),
      registerPayment: i18n.t("finance.errors.registerPayment"),
      unknown: i18n.t("finance.errors.unknown"),
    },
    table: {
      expenses: {
        name: i18n.t("finance.table.expenses.name"),
        type: i18n.t("finance.table.expenses.type"),
        total: i18n.t("finance.table.expenses.total"),
        percentage: i18n.t("finance.table.expenses.percentage"),
        pending: i18n.t("finance.table.expenses.pending"),
        status: i18n.t("finance.table.expenses.status"),
        actions: i18n.t("finance.table.expenses.actions"),
      },
      incomes: {
        name: i18n.t("finance.table.incomes.name"),
        source: i18n.t("finance.table.incomes.source"),
        amount: i18n.t("finance.table.incomes.amount"),
        date: i18n.t("finance.table.incomes.date"),
        concept: i18n.t("finance.table.incomes.concept"),
        actions: i18n.t("finance.table.incomes.actions"),
        viewDistribution: i18n.t("finance.table.incomes.viewDistribution"),
      },
    },
    // Translations for ListTable batch actions
    selectAll: actionTranslations?.selectAll || "Seleccionar todo",
    unselectAll: actionTranslations?.unselectAll || "Deseleccionar todo",
    selectNone: actionTranslations?.selectNone || "Ninguno",
    selected: actionTranslations?.selected || "seleccionado",
    selectedsShort: actionTranslations?.selectedsShort || "sel.",
    selecteds: actionTranslations?.selecteds || "seleccionados",
    actions: actionTranslations?.actions || "Acciones",
    action: actionTranslations?.action || "Acción",
    clear: actionTranslations?.clear || "Limpiar",
    save: actionTranslations?.save || "Guardar",
    add: i18n.t("finance.buttons.newExpense"),
    delete: i18n.t("finance.buttons.delete"),
    close: i18n.t("actions.close"),
    cancel: i18n.t("actions.cancel"),
    confirmDelete: i18n.t("finance.messages.deleteExpenseConfirm"),
    confirmDeleteSelected: i18n.t("finance.messages.deleteExpenseConfirm"),
  };

  // Configuración de headers y campos para Expenses
  const expensesLayoutConfig = {
    headers: [
      { key: "name", header: translations.table.expenses.name, default: true },
      { key: "type", header: translations.table.expenses.type },
      { key: "totalAmount", header: translations.table.expenses.total },
      { key: "percentageToCharge", header: translations.table.expenses.percentage },
      { key: "amountToCharge", header: translations.table.expenses.pending },
      { key: "status", header: translations.table.expenses.status },
    ],
  };

  const expensesFields = {
    titles: {
      name: "finance.fields.name",
      type: "finance.fields.type",
      totalAmount: "finance.fields.totalAmount",
      percentageToCharge: "finance.fields.percentageToCharge",
      amountToCharge: "finance.fields.amountToCharge",
      status: "finance.fields.status",
      concept: "finance.fields.concept",
      description: "finance.fields.description",
      valueDate: "finance.fields.valueDate",
    },
    types: {
      name: "text",
      type: "select",
      totalAmount: "number",
      percentageToCharge: "number",
      amountToCharge: "number",
      status: "select",
      concept: "text",
      description: "textarea",
      valueDate: "date",
    },
    options: {
      type: {
        options: [
          { id: "OPERATIONAL", value: "finance.enums.expenseType.OPERATIONAL" },
          { id: "EXTRAORDINARY", value: "finance.enums.expenseType.EXTRAORDINARY" },
        ],
      },
      status: {
        options: [
          { id: ExpenseStatus.PENDING, value: "finance.enums.expenseStatus.PENDING" },
          { id: ExpenseStatus.PARTIAL, value: "finance.enums.expenseStatus.PARTIAL" },
          { id: ExpenseStatus.PAID, value: "finance.enums.expenseStatus.PAID" },
        ],
      },
    },
  };

  // Configuración de headers y campos para Incomes
  const incomesLayoutConfig = {
    headers: [
      { key: "name", header: translations.table.incomes.name, default: true },
      { key: "source", header: translations.table.incomes.source },
      { key: "amount", header: translations.table.incomes.amount },
      { key: "concept", header: translations.table.incomes.concept },
      { key: "receivedAt", header: translations.table.incomes.date },
    ],
  };

  const incomesFields = {
    titles: {
      name: "finance.fields.name",
      source: "finance.fields.source",
      amount: "finance.fields.amount",
      concept: "finance.fields.concept",
      receivedAt: "finance.fields.receivedAt",
    },
    types: {
      name: "text",
      source: "text",
      amount: "number",
      concept: "text",
      receivedAt: "date",
    },
    options: {},
  };

  return (
    <FinanceOperationsClient
      translations={translations}
      expensesLayoutConfig={expensesLayoutConfig}
      expensesFields={expensesFields}
      incomesLayoutConfig={incomesLayoutConfig}
      incomesFields={incomesFields}
    />
  );
}
