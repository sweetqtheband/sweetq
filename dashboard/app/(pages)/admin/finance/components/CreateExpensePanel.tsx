"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  TextInput,
  NumberInput,
  Select,
  SelectItem,
  Section,
  Form,
  FormItem,
  Heading,
} from "@carbon/react";
import { Expenses } from "@/types/expense";
import { ExpenseType } from "@/types/finances";
import { CreateExpenseRequest } from "@/types/finances";
import { useToast } from "@/app/context/ToastContext";
import { Panel } from "@/app/components";
import { FINANCE_PANEL_ACTIONS, type FinancePanelAction } from "../constants";
import "../operations/operations.scss";

interface CreateExpensePanelProps {
  open: FinancePanelAction | "";
  setOpen: (value: FinancePanelAction | "") => void;
  onSubmit: (data: CreateExpenseRequest) => Promise<void>;
  editingExpense?: Expenses | null;
  translations?: Record<string, any>;
}

export const CreateExpensePanel: React.FC<CreateExpensePanelProps> = ({
  open,
  setOpen,
  onSubmit,
  editingExpense,
  translations = {},
}) => {
  const { addToast } = useToast();
  const t = translations.panels?.createExpense || {};
  const toastMessages = {
    error: translations?.toasts?.error || "Error",
    requiredFields:
      translations?.toasts?.requiredFields || "Por favor completa los campos requeridos",
    success: translations?.toasts?.success || "Éxito",
    expenseCreated: translations?.toasts?.expenseCreated || "Gasto creado correctamente",
  };
  const [formData, setFormData] = useState({
    name: "",
    type: ExpenseType.OPERATIONAL,
    concept: "",
    totalAmount: 0,
    percentageToCharge: 100,
    description: "",
    valueDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [forceClose, setForceClose] = useState(false);

  useEffect(() => {
    if (editingExpense) {
      setFormData({
        name: editingExpense.name || "",
        type: editingExpense.type || ExpenseType.OPERATIONAL,
        concept: editingExpense.concept || "",
        totalAmount: editingExpense.totalAmount || 0,
        percentageToCharge: editingExpense.percentageToCharge || 100,
        description: editingExpense.description || "",
        valueDate: editingExpense.valueDate
          ? new Date(editingExpense.valueDate).toISOString().split("T")[0]
          : "",
      });
    } else {
      setFormData({
        name: "",
        type: ExpenseType.OPERATIONAL,
        concept: "",
        totalAmount: 0,
        percentageToCharge: 100,
        description: "",
        valueDate: "",
      });
    }
  }, [editingExpense]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.concept || formData.totalAmount <= 0) {
      addToast({
        title: toastMessages.error,
        subtitle: toastMessages.requiredFields,
        kind: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const data: CreateExpenseRequest = {
        name: formData.name,
        type: formData.type as ExpenseType,
        concept: formData.concept,
        totalAmount: formData.totalAmount,
        percentageToCharge: formData.percentageToCharge,
        description: formData.description,
        valueDate: formData.valueDate ? new Date(formData.valueDate) : undefined,
      };

      await onSubmit(data);
      addToast({
        title: toastMessages.success,
        subtitle: toastMessages.expenseCreated,
        kind: "success",
      });
      setForceClose(true);
    } catch (err: any) {
      addToast({
        title: toastMessages.error,
        subtitle: `${toastMessages.error}: ${err?.message}`,
        kind: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForceClose(false);
    setFormData({
      name: "",
      type: ExpenseType.OPERATIONAL,
      concept: "",
      totalAmount: 0,
      percentageToCharge: 100,
      description: "",
      valueDate: "",
    });
    setOpen("");
  };

  const getContent = () => (
    <>
      <Section className="fields" level={4}>
        <Form>
          <Heading>
            {editingExpense ? t.editTitle || "✏️ Editar Gasto" : t.title || "➕ Crear Nuevo Gasto"}
          </Heading>

          <Section className="wrapper-fields" level={5}>
            <FormItem>
              <TextInput
                id="name"
                labelText={t.labels?.name || "Nombre del Gasto *"}
                placeholder={t.placeholders?.name || "Ej: Alquiler Sala Black Bourbon"}
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </FormItem>

            <FormItem>
              <Select
                id="type"
                labelText={t.labels?.type || "Tipo de Gasto *"}
                value={formData.type}
                onChange={(e) => handleChange("type", e.target.value)}
              >
                <SelectItem
                  value={ExpenseType.OPERATIONAL}
                  text={t.types?.operational || "Operativo"}
                />
                <SelectItem value={ExpenseType.CORE} text={t.types?.core || "Núcleo"} />
              </Select>
            </FormItem>

            <FormItem>
              <TextInput
                id="concept"
                labelText={t.labels?.concept || "Concepto (vinculado a ingresos) *"}
                placeholder={t.placeholders?.concept || "Ej: Concierto Black Bourbon"}
                value={formData.concept}
                onChange={(e) => handleChange("concept", e.target.value)}
              />
            </FormItem>

            <FormItem>
              <NumberInput
                id="totalAmount"
                label={t.labels?.totalAmount || "Monto Total € *"}
                value={formData.totalAmount}
                onChange={(e: any) =>
                  handleChange("totalAmount", Number((e.target as HTMLInputElement).value))
                }
                min={0}
                step={0.01}
              />
            </FormItem>

            <FormItem>
              <NumberInput
                id="percentage"
                label={t.labels?.percentage || "% a Cobrar (0-100) *"}
                value={formData.percentageToCharge}
                onChange={(e: any) =>
                  handleChange("percentageToCharge", Number((e.target as HTMLInputElement).value))
                }
                allowEmpty={true}
                min={0}
                max={100}
                step={1}
              />
              <p className="cds--label" style={{ marginTop: "0.5rem", color: "#525252" }}>
                {t.help?.toCharge || "A cobrar:"}{" "}
                {(formData.totalAmount * (formData.percentageToCharge / 100)).toFixed(2)}€
              </p>
            </FormItem>

            <FormItem>
              <TextInput
                id="valueDate"
                labelText={t.labels?.valueDate || "Fecha Contable (opcional)"}
                type="date"
                value={formData.valueDate}
                onChange={(e) => handleChange("valueDate", e.target.value)}
              />
            </FormItem>

            <FormItem>
              <TextInput
                id="description"
                labelText={t.labels?.description || "Descripción (opcional)"}
                placeholder="Notas adicionales..."
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </FormItem>
          </Section>
        </Form>
      </Section>

      <footer>
        <Button kind="primary" onClick={handleSubmit} disabled={loading}>
          {editingExpense ? t.buttons?.update || "Actualizar" : t.buttons?.create || "Crear Gasto"}
        </Button>
      </footer>
    </>
  );

  const content = open === FINANCE_PANEL_ACTIONS.CREATE_EXPENSE ? getContent() : null;

  return (
    <Panel onClose={handleClose} forceClose={forceClose}>
      {content}
    </Panel>
  );
};
