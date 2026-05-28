"use client";

import React, { useState } from "react";
import {
  Button,
  NumberInput,
  Select,
  SelectItem,
  Section,
  Form,
  FormItem,
  Heading,
  TextInput,
} from "@carbon/react";
import { CreatePaymentRecordRequest } from "@/types/finances";
import { Expenses } from "@/types/expense";
import { FinanceUsers } from "@/types/finances";
import { useFinance } from "../context/FinanceContext";
import { useToast } from "@/app/context/ToastContext";
import { Panel } from "@/app/components";
import { FINANCE_PANEL_ACTIONS, type FinancePanelAction } from "../constants";
import "../operations/operations.scss";

interface PaymentPanelProps {
  open: FinancePanelAction | "";
  setOpen: (value: FinancePanelAction | "") => void;
  onSubmit: (expenseId: string, data: CreatePaymentRecordRequest) => Promise<void>;
  selectedExpense?: Expenses | null;
  users?: FinanceUsers[];
  translations?: Record<string, any>;
}

export const PaymentPanel: React.FC<PaymentPanelProps> = ({
  open,
  setOpen,
  onSubmit,
  selectedExpense,
  users = [],
  translations = {},
}) => {
  const { currentFinanceUser } = useFinance();
  const { addToast } = useToast();
  const t = translations.panels?.registerPayment || {};
  const toastMessages = {
    error: translations?.toasts?.error || "Error",
    amountGreaterThanZero:
      translations?.toasts?.amountGreaterThanZero || "La cantidad debe ser mayor a 0",
    expenseNotSelected: translations?.toasts?.expenseNotSelected || "No hay gasto seleccionado",
    userNotSelected: translations?.toasts?.userNotSelected || "Usuario financiero no seleccionado",
    success: translations?.toasts?.success || "Éxito",
    paymentRegistered: translations?.toasts?.paymentRegistered || "Pago registrado correctamente",
  };
  const [formData, setFormData] = useState({
    amount: 0,
    method: "transferencia",
    paymentDate: new Date().toISOString().split("T")[0],
    reference: "",
    paidByUser: currentFinanceUser?._id || "",
  });

  const [loading, setLoading] = useState(false);
  const [forceClose, setForceClose] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (formData.amount <= 0) {
      addToast({
        title: toastMessages.error,
        subtitle: toastMessages.amountGreaterThanZero,
        kind: "error",
      });
      return;
    }

    if (!selectedExpense) {
      addToast({
        title: toastMessages.error,
        subtitle: toastMessages.expenseNotSelected,
        kind: "error",
      });
      return;
    }

    if (!formData.paidByUser) {
      addToast({
        title: toastMessages.error,
        subtitle: toastMessages.userNotSelected,
        kind: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const data: CreatePaymentRecordRequest = {
        paidBy: formData.paidByUser,
        amount: formData.amount,
      };

      await onSubmit(selectedExpense._id, data);
      addToast({
        title: toastMessages.success,
        subtitle: toastMessages.paymentRegistered,
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
      amount: 0,
      method: "transferencia",
      paymentDate: new Date().toISOString().split("T")[0],
      reference: "",
      paidByUser: currentFinanceUser?._id || "",
    });
    setOpen("");
  };

  const getContent = () => (
    <>
      <Section className="fields" level={4}>
        <Form>
          <Heading>
            {t.title || "💳 Registrar Pago"}
            {selectedExpense && (
              <p className="cds--paragraph cds--label">
                {t.expense || "Gasto:"} <strong>{selectedExpense.name}</strong>
              </p>
            )}
          </Heading>

          <Section className="wrapper-fields" level={5}>
            {selectedExpense && (
              <div className="expense-info">
                <div className="info-row">
                  <span>{t.total || "Total:"}:</span>
                  <strong>{selectedExpense.totalAmount.toFixed(2)}€</strong>
                </div>
                <div className="info-row">
                  <span>
                    {t.toCharge || "A Cobrar"} ({selectedExpense.percentageToCharge}%):
                  </span>
                  <strong>
                    {(
                      selectedExpense.totalAmount *
                      (selectedExpense.percentageToCharge / 100)
                    ).toFixed(2)}
                    €
                  </strong>
                </div>
              </div>
            )}

            <FormItem>
              <NumberInput
                id="amount"
                label={t.labels?.amount || "Cantidad a Registrar € *"}
                value={formData.amount}
                onChange={(e: any) =>
                  handleChange("amount", Number((e.target as HTMLInputElement).value))
                }
                min={0}
                max={
                  selectedExpense
                    ? selectedExpense.totalAmount * (selectedExpense.percentageToCharge / 100)
                    : 0
                }
                step={0.01}
              />
            </FormItem>

            <FormItem>
              <Select
                id="paidByUser"
                labelText={t.labels?.paidBy || "Usuario que Paga *"}
                value={formData.paidByUser}
                onChange={(e) => handleChange("paidByUser", e.target.value)}
              >
                <SelectItem
                  value=""
                  text={t.placeholders?.selectUser || "Selecciona un usuario"}
                  disabled
                  hidden
                />
                {users.map((user) => (
                  <SelectItem key={String(user._id)} value={String(user._id)} text={user.name} />
                ))}
              </Select>
            </FormItem>

            <FormItem>
              <Select
                id="method"
                labelText={t.labels?.method || "Método de Pago *"}
                value={formData.method}
                onChange={(e) => handleChange("method", e.target.value)}
              >
                <SelectItem value="transferencia" text={t.methods?.transfer || "Transferencia"} />
                <SelectItem value="efectivo" text={t.methods?.cash || "Efectivo"} />
                <SelectItem value="tarjeta" text={t.methods?.card || "Tarjeta"} />
                <SelectItem value="bizum" text={t.methods?.bizum || "Bizum"} />
                <SelectItem value="otro" text={t.methods?.other || "Otro"} />
              </Select>
            </FormItem>

            <FormItem>
              <TextInput
                id="paymentDate"
                labelText={t.labels?.paymentDate || "Fecha de Pago *"}
                type="date"
                value={formData.paymentDate}
                onChange={(e) => handleChange("paymentDate", e.target.value)}
              />
            </FormItem>

            <FormItem>
              <TextInput
                id="reference"
                labelText={t.labels?.reference || "Referencia (opcional)"}
                placeholder={t.placeholders?.reference || "Número de transferencia, recibo, etc."}
                value={formData.reference}
                onChange={(e) => handleChange("reference", e.target.value)}
              />
            </FormItem>
          </Section>
        </Form>
      </Section>

      <footer>
        <Button kind="primary" onClick={handleSubmit} disabled={loading}>
          {t.buttons?.register || "Registrar Pago"}
        </Button>
      </footer>
    </>
  );

  const content = open === FINANCE_PANEL_ACTIONS.PAYMENT && selectedExpense ? getContent() : null;

  return (
    <Panel onClose={handleClose} forceClose={forceClose}>
      {content}
    </Panel>
  );
};
