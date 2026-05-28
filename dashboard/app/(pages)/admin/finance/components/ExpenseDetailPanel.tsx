import React, { useState } from "react";
import { Button } from "@carbon/react";
import { Expenses } from "@/types/expense";
import { ExpensePayments } from "@/types/expensePayment";
import { FinanceUsers } from "@/types/finances";
import { ExpensePaymentDetail } from "@/types/financeDetails";

interface ExpenseDetailPanelProps {
  expense: Expenses | null;
  payments: ExpensePayments[];
  onRegisterPayment: () => void;
  users: FinanceUsers[];
  translations?: Record<string, any>;
}

/**
 * Panel de detalle de un gasto
 * Muestra las obligaciones de pago y el historial
 */
export const ExpenseDetailPanel: React.FC<ExpenseDetailPanelProps> = ({
  expense,
  payments,
  onRegisterPayment,
  users,
  translations = {},
}) => {
  if (!expense) return null;
  const t = translations.panels?.detail || {};

  // Calcular cuota individual
  const cuotaIndividual = expense.amountToCharge / (payments.length || 1);

  // Mapear usuarios con sus detalles de pago
  const paymentDetails: ExpensePaymentDetail[] = payments.map((payment) => {
    const user = users.find((u) => u._id === payment.userId);
    return {
      userId: payment.userId,
      userName: user?.name || "Desconocido",
      amountDue: payment.amountDue,
      amountPaid: 0, // TODO: Calcular desde ExpensePaymentRecord
      amountPending: payment.amountDue,
      status: payment.status,
      paidRecords: [],
    };
  });

  const totalPaid = paymentDetails.reduce((sum, p) => sum + p.amountPaid, 0);
  const totalPending = expense.amountToCharge - totalPaid;

  return (
    <div className="expense-detail-panel">
      <div className="panel-header">
        <h2>{expense.name}</h2>
        <div className="expense-summary">
          <p>
            <strong>Total:</strong> {expense.totalAmount}€ | <strong>% a cobrar:</strong>{" "}
            {expense.percentageToCharge}% | <strong>A cobrar:</strong> {expense.amountToCharge}€
          </p>
          <p>
            <strong>Estado:</strong>{" "}
            <span className={`status-${expense.status}`}>{expense.status}</span>
          </p>
        </div>
      </div>

      <div className="obligations-section">
        <h3>{t.sections?.obligations || "Obligaciones Individuales"}</h3>
        <table className="obligations-table">
          <thead>
            <tr>
              <th>{t.sections?.table?.user || "Usuario"}</th>
              <th>{t.sections?.table?.quota || "Cuota"}</th>
              <th>{t.sections?.table?.paid || "Pagado"}</th>
              <th>{t.sections?.table?.pending || "Pendiente"}</th>
              <th>{t.sections?.table?.status || "Estado"}</th>
            </tr>
          </thead>
          <tbody>
            {paymentDetails.map((detail) => (
              <tr key={detail.userId}>
                <td>{detail.userName}</td>
                <td>{detail.amountDue}€</td>
                <td>{detail.amountPaid}€</td>
                <td>{detail.amountPending}€</td>
                <td>
                  <span className={`status-${detail.status}`}>{detail.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5}>
                <strong>
                  {t.sections?.table?.total || "TOTAL"}: {expense.amountToCharge}€ |{" "}
                  {t.sections?.table?.paid || "Pagado"}: {totalPaid}€ |{" "}
                  {t.sections?.table?.pending || "Pendiente"}: {totalPending}€
                </strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="actions">
        <Button kind="primary" onClick={onRegisterPayment}>
          {t.buttons?.registerPayment || "Registrar Pago"}
        </Button>
        <Button kind="secondary">{t.buttons?.viewHistory || "Ver Historial"}</Button>
      </div>
    </div>
  );
};
