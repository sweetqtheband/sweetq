import type { Expenses } from "@/types/expense";
import type { ExpenseStatus } from "@/types/finances";

/**
 * Configuración de layout para la tabla de gastos
 * Compatible con ListLayout/ListTable
 */

export const getExpensesLayoutConfig = () => {
  const headers = [
    {
      key: "name",
      header: "Nombre",
      default: true,
    },
    {
      key: "type",
      header: "Tipo",
    },
    {
      key: "totalAmount",
      header: "Total",
    },
    {
      key: "percentageToCharge",
      header: "% Cobrado",
    },
    {
      key: "amountToCharge",
      header: "Pendiente",
    },
    {
      key: "status",
      header: "Estado",
    },
  ];

  const fields = {
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
          { id: "OPERATIONAL", value: "Operacional" },
          { id: "EXTRAORDINARY", value: "Extraordinario" },
        ],
      },
      status: {
        options: [
          { id: "PENDING", value: "Pendiente" },
          { id: "PARTIAL", value: "Parcial" },
          { id: "PAID", value: "Pagado" },
        ],
      },
    },
  };

  const filters = {
    status: {
      type: "select",
      label: "Estado",
      fields: {
        status: {
          type: "select",
          label: "Estado",
          options: [
            { id: "PENDING", value: "Pendiente" },
            { id: "PARTIAL", value: "Parcial" },
            { id: "PAID", value: "Pagado" },
          ],
        },
      },
    },
    type: {
      type: "select",
      label: "Tipo",
      fields: {
        type: {
          type: "select",
          label: "Tipo",
          options: [
            { id: "OPERATIONAL", value: "Operacional" },
            { id: "EXTRAORDINARY", value: "Extraordinario" },
          ],
        },
      },
    },
    dateRange: {
      type: "date-range",
      label: "Período",
      fields: {
        startDate: { type: "date", label: "Desde" },
        endDate: { type: "date", label: "Hasta" },
      },
    },
  };

  const batchActions = {
    delete: {
      label: "Eliminar",
      icon: "trash",
    },
  };

  return {
    headers,
    fields,
    filters,
    batchActions,
  };
};
