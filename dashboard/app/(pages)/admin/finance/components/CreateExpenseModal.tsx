import React, { useState, useEffect } from "react";
import { Modal, Button, Select, SelectItem, TextInput, NumberInput, TextArea } from "@carbon/react";
import { Expenses } from "@/types/expense";
import { ExpenseType } from "@/types/finances";
import { CreateExpenseRequest } from "@/types/finances";
import { useFinance } from "../context/FinanceContext";
import { useToast } from "@/app/context/ToastContext";
import "../operations/operations.scss";

interface CreateExpenseModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateExpenseRequest) => Promise<void>;
  editingExpense?: Expenses | null;
  translations?: Record<string, any>;
}

/**
 * Modal para crear o editar un nuevo gasto
 */
export const CreateExpenseModal: React.FC<CreateExpenseModalProps> = ({
  open,
  onClose,
  onSubmit,
  editingExpense,
  translations = {},
}) => {
  const { currentFinanceUser } = useFinance();
  const { addToast } = useToast();
  const toastMessages = {
    error: translations?.toasts?.error || "Error",
    requiredFields:
      translations?.toasts?.requiredFields || "Por favor completa los campos requeridos",
    userNotSelected: translations?.toasts?.userNotSelected || "Usuario financiero no seleccionado",
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

  // Cargar datos del gasto en edición
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
  }, [editingExpense, open]);

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

      // Reset form
      setFormData({
        name: "",
        type: ExpenseType.OPERATIONAL,
        concept: "",
        totalAmount: 0,
        percentageToCharge: 100,
        description: "",
        valueDate: "",
      });
      addToast({
        title: toastMessages.success,
        subtitle: toastMessages.expenseCreated,
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
      open={open}
      primaryButtonText={editingExpense ? "Actualizar Gasto" : "Crear Gasto"}
      secondaryButtonText="Cancelar"
      onRequestClose={onClose}
      onRequestSubmit={handleSubmit}
      modalHeading={editingExpense ? "Editar Gasto" : "Crear Nuevo Gasto"}
      primaryButtonDisabled={loading || !currentFinanceUser}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Usuario Actual */}
        {currentFinanceUser && (
          <div style={{ padding: "0.75rem", backgroundColor: "#e7f1ff", borderRadius: "4px" }}>
            <small style={{ color: "#0043ce" }}>
              👤 Creando como: <strong>{currentFinanceUser.name}</strong>
            </small>
          </div>
        )}

        {/* Nombre */}
        <TextInput
          id="expense-name"
          labelText="Nombre del Gasto *"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Ej: Alquiler Sala Black Bourbon"
        />

        {/* Tipo */}
        <Select
          id="expense-type"
          labelText="Tipo de Gasto *"
          value={formData.type}
          onChange={(e) => handleChange("type", e.target.value)}
        >
          <SelectItem value={ExpenseType.OPERATIONAL} text="Operativo" />
          <SelectItem value={ExpenseType.CORE} text="Núcleo" />
        </Select>

        {/* Concepto */}
        <TextInput
          id="expense-concept"
          labelText="Concepto (vinculado a ingresos) *"
          value={formData.concept}
          onChange={(e) => handleChange("concept", e.target.value)}
          placeholder="Ej: Concierto Black Bourbon"
        />

        {/* Monto Total */}
        <NumberInput
          id="expense-amount"
          label="Monto Total € *"
          value={formData.totalAmount}
          onChange={(e: any) =>
            handleChange("totalAmount", Number((e.target as HTMLInputElement).value))
          }
          min={0}
          step={0.01}
        />

        {/* Porcentaje a Cobrar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <NumberInput
            id="expense-percentage"
            label="% a Cobrar (0-100) *"
            value={formData.percentageToCharge}
            onChange={(e: any) =>
              handleChange("percentageToCharge", Number((e.target as HTMLInputElement).value))
            }
            min={0}
            max={100}
            step={1}
          />
          <small style={{ color: "#525252" }}>
            A cobrar: {(formData.totalAmount * (formData.percentageToCharge / 100)).toFixed(2)}€
          </small>
        </div>

        {/* Fecha Contable */}
        <TextInput
          id="expense-date"
          labelText="Fecha Contable (opcional)"
          type="date"
          value={formData.valueDate}
          onChange={(e) => handleChange("valueDate", e.target.value)}
        />

        {/* Descripción */}
        <TextArea
          id="expense-description"
          labelText="Descripción (opcional)"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Notas adicionales..."
          rows={3}
        />
      </div>
    </Modal>
  );
};
