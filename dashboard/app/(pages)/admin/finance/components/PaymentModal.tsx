import React, { useState } from "react";
import {
  Modal,
  Button,
  Select,
  SelectItem,
  NumberInput,
  DatePicker,
  DatePickerInput,
  InlineNotification,
} from "@carbon/react";
import { Expenses } from "@/types/expense";
import { FinanceUsers } from "@/types/finances";
import { ExpensePayments } from "@/types/expensePayment";
import { CreatePaymentRecordRequest } from "@/types/finances";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePaymentRecordRequest) => Promise<void>;
  expense: Expenses | null;
  payments: ExpensePayments[];
  users: FinanceUsers[];
  translations?: Record<string, any>;
}

/**
 * Modal para registrar un pago de gasto
 */
export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  expense,
  payments,
  users,
  translations = {},
}) => {
  const [paidBy, setPaidBy] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [paidTo, setPaidTo] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: "error" | "success" | "warning" | "info";
    message: string;
  } | null>(null);
  const t = translations.panels?.payment || {};

  const handleSubmit = async () => {
    if (!paidBy || amount <= 0) {
      setNotification({
        type: "error",
        message: translations?.validation?.completeFields || "Por favor completa todos los campos",
      });
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        paidBy,
        amount,
        paidTo: paidTo || null,
      });
      // Reset form
      setPaidBy("");
      setAmount(0);
      setPaidTo(undefined);
      setNotification(null);
      onClose();
    } catch (err: any) {
      setNotification({
        type: "error",
        message: `Error: ${err?.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!expense) return null;

  // Calcular cuota individual
  const cuotaIndividual = expense.amountToCharge / (payments.length || 1);

  return (
    <Modal
      open={isOpen}
      primaryButtonText={t.labels?.registerPayment || "Registrar Pago"}
      secondaryButtonText={translations?.actions?.cancel || "Cancelar"}
      onRequestClose={onClose}
      onRequestSubmit={handleSubmit}
      modalHeading={`${t.title || "Registrar Pago"} - ${expense.name}`}
      primaryButtonDisabled={loading}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {notification && (
          <InlineNotification
            kind={notification.type}
            subtitle={notification.message}
            title={notification.type === "error" ? "Error" : "Aviso"}
            onClose={() => setNotification(null)}
          />
        )}
        {/* Quién paga */}
        <Select
          id="payment-user"
          labelText={t.labels?.paidBy || "¿Quién paga?"}
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
        >
          <SelectItem value="" text={t.placeholders?.selectUser || "Selecciona un usuario"} />
          {users.map((user) => (
            <SelectItem
              key={user._id}
              value={user._id}
              text={`${user.name} (cuota: ${cuotaIndividual}€)`}
            />
          ))}
        </Select>

        {/* Cuánto paga */}
        <NumberInput
          id="payment-amount"
          label={(t.labels?.amount || "¿Cuánto paga? (máximo: {quota}€)").replace(
            "{quota}",
            String(cuotaIndividual)
          )}
          value={amount}
          onChange={(e: any) => setAmount(Number((e.target as HTMLInputElement).value))}
          max={cuotaIndividual}
          min={0}
          step={0.01}
        />

        {/* Quién adelantó (opcional) */}
        <Select
          id="payment-paidto"
          labelText={t.labels?.paidTo || "¿Quién adelantó? (opcional)"}
          value={paidTo || ""}
          onChange={(e) => setPaidTo(e.target.value || undefined)}
        >
          <SelectItem value="" text={t.placeholders?.noPaid || "Nadie (pago normal)"} />
          {users.map((user) => (
            <SelectItem key={user._id} value={user._id} text={`${user.name} adelantó`} />
          ))}
        </Select>

        {/* Info de validación */}
        <div style={{ fontSize: "12px", color: "#666" }}>
          {amount > 0 && (
            <p>
              💡{" "}
              {t.info
                ? t.info
                    .replace(
                      "{user}",
                      paidBy ? users.find((u) => u._id === paidBy)?.name || "" : ""
                    )
                    .replace("{amount}", String(amount))
                    .replace(
                      "{credit}",
                      paidTo
                        ? ` (asignado a crédito de ${users.find((u) => u._id === paidTo)?.name})`
                        : ""
                    )
                : `Se registrará: ${paidBy && users.find((u) => u._id === paidBy)?.name} paga ${amount}€${paidTo ? ` (asignado a crédito de ${users.find((u) => u._id === paidTo)?.name})` : ""}`}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};
