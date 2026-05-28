import React, { useState, useEffect } from "react";
import { Modal, Button, TextInput, NumberInput, TextArea } from "@carbon/react";
import { Incomes } from "@/types/income";
import { CreateIncomeRequest } from "@/types/finances";
import { useToast } from "@/app/context/ToastContext";
import "../operations/operations.scss";

interface CreateIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateIncomeRequest) => Promise<void>;
  editingIncome?: Incomes | null;
  translations?: Record<string, any>;
}

/**
 * Modal para crear o editar un ingreso
 */
export const CreateIncomeModal: React.FC<CreateIncomeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingIncome,
  translations = {},
}) => {
  const { addToast } = useToast();
  const toastMessages = {
    error: translations?.toasts?.error || "Error",
    requiredFields:
      translations?.toasts?.requiredFields || "Por favor completa los campos requeridos",
    success: translations?.toasts?.success || "Éxito",
    incomeCreated: translations?.toasts?.incomeCreated || "Ingreso creado correctamente",
  };
  const [formData, setFormData] = useState({
    name: "",
    concept: "",
    amount: 0,
    source: "",
    description: "",
    valueDate: "",
    receivedAt: new Date().toISOString().split("T")[0],
  });

  const [loading, setLoading] = useState(false);

  // Cargar datos del ingreso en edición
  useEffect(() => {
    if (editingIncome) {
      setFormData({
        name: editingIncome.name || "",
        concept: editingIncome.concept || "",
        amount: editingIncome.amount || 0,
        source: editingIncome.source || "",
        description: editingIncome.description || "",
        valueDate: editingIncome.valueDate
          ? new Date(editingIncome.valueDate).toISOString().split("T")[0]
          : "",
        receivedAt: editingIncome.receivedAt
          ? new Date(editingIncome.receivedAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      });
    } else {
      setFormData({
        name: "",
        concept: "",
        amount: 0,
        source: "",
        description: "",
        valueDate: "",
        receivedAt: new Date().toISOString().split("T")[0],
      });
    }
  }, [editingIncome, isOpen]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.concept || formData.amount <= 0 || !formData.receivedAt) {
      addToast({
        title: toastMessages.error,
        subtitle: toastMessages.requiredFields,
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
        source: formData.source || "No especificado",
        description: formData.description,
        valueDate: formData.valueDate ? new Date(formData.valueDate) : undefined,
        receivedAt: new Date(formData.receivedAt),
      };

      await onSubmit(data);

      // Reset form
      setFormData({
        name: "",
        concept: "",
        amount: 0,
        source: "",
        description: "",
        valueDate: "",
        receivedAt: new Date().toISOString().split("T")[0],
      });
      addToast({
        title: toastMessages.success,
        subtitle: toastMessages.incomeCreated,
        kind: "success",
      });
      onClose();
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

  return (
    <Modal
      open={isOpen}
      primaryButtonText={editingIncome ? "Actualizar Ingreso" : "Crear Ingreso"}
      secondaryButtonText="Cancelar"
      onRequestClose={onClose}
      onRequestSubmit={handleSubmit}
      modalHeading={editingIncome ? "Editar Ingreso" : "Crear Nuevo Ingreso"}
      primaryButtonDisabled={loading}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Nombre */}
        <TextInput
          id="income-name"
          labelText="Nombre del Ingreso *"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Ej: Concierto Black Bourbon"
        />

        {/* Concepto */}
        <TextInput
          id="income-concept"
          labelText="Concepto (debe coincidir con gastos) *"
          value={formData.concept}
          onChange={(e) => handleChange("concept", e.target.value)}
          placeholder="Ej: Concierto Black Bourbon"
        />

        {/* Monto */}
        <NumberInput
          id="income-amount"
          label="Monto € *"
          value={formData.amount}
          onChange={(e: any) =>
            handleChange("amount", Number((e.target as HTMLInputElement).value))
          }
          min={0}
          step={0.01}
        />

        {/* Fuente */}
        <TextInput
          id="income-source"
          labelText="Fuente"
          value={formData.source}
          onChange={(e) => handleChange("source", e.target.value)}
          placeholder="Ej: Sala Black, Festival, Contrato"
        />

        {/* Fecha de Recepción */}
        <TextInput
          id="income-received-date"
          labelText="Fecha de Recepción *"
          type="date"
          value={formData.receivedAt}
          onChange={(e) => handleChange("receivedAt", e.target.value)}
        />

        {/* Fecha Contable */}
        <TextInput
          id="income-value-date"
          labelText="Fecha Contable (opcional)"
          type="date"
          value={formData.valueDate}
          onChange={(e) => handleChange("valueDate", e.target.value)}
        />

        {/* Descripción */}
        <TextArea
          id="income-description"
          labelText="Descripción (opcional)"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Notas adicionales..."
          rows={3}
        />

        {!editingIncome && (
          <div style={{ fontSize: "12px", color: "#666" }}>
            💡 Al crear el ingreso, se calculará automáticamente la distribución según los gastos
            del concepto
          </div>
        )}
      </div>
    </Modal>
  );
};
