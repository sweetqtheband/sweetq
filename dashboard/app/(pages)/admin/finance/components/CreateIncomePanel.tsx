"use client";

import React, { useState, useEffect } from "react";
import { Button, TextInput, NumberInput, Section, Form, FormItem, Heading } from "@carbon/react";
import { Incomes } from "@/types/income";
import { CreateIncomeRequest } from "@/types/finances";
import { useFinance } from "../context/FinanceContext";
import { useToast } from "@/app/context/ToastContext";
import { Panel } from "@/app/components";
import { FINANCE_PANEL_ACTIONS, type FinancePanelAction } from "../constants";
import "../operations/operations.scss";

interface CreateIncomePanelProps {
  open: FinancePanelAction | "";
  setOpen: (value: FinancePanelAction | "") => void;
  onSubmit: (data: CreateIncomeRequest) => Promise<void>;
  editingIncome?: Incomes | null;
  translations?: Record<string, any>;
}

export const CreateIncomePanel: React.FC<CreateIncomePanelProps> = ({
  open,
  setOpen,
  onSubmit,
  editingIncome,
  translations = {},
}) => {
  const { currentFinanceUser } = useFinance();
  const { addToast } = useToast();
  const t = translations.panels?.createIncome || {};
  const toastMessages = {
    error: translations?.toasts?.error || "Error",
    requiredFields:
      translations?.toasts?.requiredFields || "Por favor completa los campos requeridos",
    userNotSelected: translations?.toasts?.userNotSelected || "Usuario financiero no seleccionado",
    success: translations?.toasts?.success || "Éxito",
    incomeCreated: translations?.toasts?.incomeCreated || "Ingreso creado correctamente",
  };
  const [formData, setFormData] = useState({
    name: "",
    concept: "",
    amount: 0,
    source: "",
    receivedAt: "",
    description: "",
    valueDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [forceClose, setForceClose] = useState(false);

  useEffect(() => {
    if (editingIncome) {
      setFormData({
        name: editingIncome.name || "",
        concept: editingIncome.concept || "",
        amount: editingIncome.amount || 0,
        source: editingIncome.source || "",
        receivedAt: editingIncome.receivedAt
          ? new Date(editingIncome.receivedAt).toISOString().split("T")[0]
          : "",
        description: editingIncome.description || "",
        valueDate: editingIncome.valueDate
          ? new Date(editingIncome.valueDate).toISOString().split("T")[0]
          : "",
      });
    } else {
      setFormData({
        name: "",
        concept: "",
        amount: 0,
        source: "",
        receivedAt: "",
        description: "",
        valueDate: "",
      });
    }
  }, [editingIncome]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.concept || formData.amount <= 0) {
      addToast({
        title: toastMessages.error,
        subtitle: toastMessages.requiredFields,
        kind: "error",
      });
      return;
    }

    if (!currentFinanceUser) {
      addToast({
        title: toastMessages.error,
        subtitle: toastMessages.userNotSelected,
        kind: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const data: CreateIncomeRequest = {
        name: formData.name,
        concept: formData.concept,
        amount: formData.amount,
        source: formData.source,
        receivedAt: formData.receivedAt ? new Date(formData.receivedAt) : new Date(),
        description: formData.description,
        valueDate: formData.valueDate ? new Date(formData.valueDate) : undefined,
      };

      await onSubmit(data);
      addToast({
        title: toastMessages.success,
        subtitle: toastMessages.incomeCreated,
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
      concept: "",
      amount: 0,
      source: "",
      receivedAt: "",
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
            {editingIncome
              ? t.editTitle || "✏️ Editar Ingreso"
              : t.title || "➕ Crear Nuevo Ingreso"}
            {currentFinanceUser && (
              <p className="cds--paragraph cds--label">
                {t.creatingAs || "Creando como:"} <strong>{currentFinanceUser.name}</strong>
              </p>
            )}
          </Heading>

          <Section className="wrapper-fields" level={5}>
            <FormItem>
              <TextInput
                id="income-name"
                labelText={t.labels?.name || "Nombre del Ingreso *"}
                placeholder={t.placeholders?.name || "Ej: Concierto Black Bourbon"}
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </FormItem>

            <FormItem>
              <TextInput
                id="income-concept"
                labelText={t.labels?.concept || "Concepto *"}
                placeholder={t.placeholders?.concept || "Ej: Concierto Black Bourbon"}
                value={formData.concept}
                onChange={(e) => handleChange("concept", e.target.value)}
              />
            </FormItem>

            <FormItem>
              <NumberInput
                id="income-amount"
                label={t.labels?.amount || "Monto € *"}
                value={formData.amount}
                onChange={(e: any) =>
                  handleChange("amount", Number((e.target as HTMLInputElement).value))
                }
                min={0}
                step={0.01}
              />
            </FormItem>

            <FormItem>
              <TextInput
                id="income-source"
                labelText={t.labels?.source || "Fuente"}
                placeholder={t.placeholders?.source || "Ej: Sala Black, Festival, Contrato"}
                value={formData.source}
                onChange={(e) => handleChange("source", e.target.value)}
              />
            </FormItem>

            <FormItem>
              <TextInput
                id="income-received-date"
                labelText={t.labels?.receivedAt || "Fecha de Recepción *"}
                type="date"
                value={formData.receivedAt}
                onChange={(e) => handleChange("receivedAt", e.target.value)}
              />
            </FormItem>

            <FormItem>
              <TextInput
                id="income-value-date"
                labelText={t.labels?.valueDate || "Fecha Contable (opcional)"}
                type="date"
                value={formData.valueDate}
                onChange={(e) => handleChange("valueDate", e.target.value)}
              />
            </FormItem>

            <FormItem>
              <TextInput
                id="income-description"
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
          {editingIncome ? t.buttons?.update || "Actualizar" : t.buttons?.create || "Crear Ingreso"}
        </Button>
      </footer>
    </>
  );

  const content = open === FINANCE_PANEL_ACTIONS.CREATE_INCOME ? getContent() : null;

  return (
    <Panel onClose={handleClose} forceClose={forceClose}>
      {content}
    </Panel>
  );
};
