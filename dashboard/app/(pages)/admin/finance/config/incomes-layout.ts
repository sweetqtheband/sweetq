import type { Incomes } from "@/types/income";

/**
 * Configuración de layout para la tabla de ingresos
 * Compatible con ListLayout/ListTable
 */

export const getIncomesLayoutConfig = () => {
  const headers = [
    {
      key: "name",
      header: "Nombre",
      default: true,
    },
    {
      key: "source",
      header: "Fuente",
    },
    {
      key: "amount",
      header: "Monto",
    },
    {
      key: "concept",
      header: "Concepto",
    },
    {
      key: "receivedAt",
      header: "Fecha",
    },
  ];

  const fields = {
    types: {
      name: "text",
      source: "text",
      amount: "number",
      concept: "text",
      receivedAt: "date",
      description: "textarea",
      valueDate: "date",
    },
  };

  const filters = {
    dateRange: {
      type: "date-range",
      label: "Período",
      fields: {
        startDate: { type: "date", label: "Desde" },
        endDate: { type: "date", label: "Hasta" },
      },
    },
    amountRange: {
      type: "number-range",
      label: "Rango de Monto",
      fields: {
        minAmount: { type: "number", label: "Mínimo" },
        maxAmount: { type: "number", label: "Máximo" },
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
