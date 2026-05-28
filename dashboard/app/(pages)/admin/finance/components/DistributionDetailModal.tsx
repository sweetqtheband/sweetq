import React from "react";
import { Modal, Button } from "@carbon/react";
import { IncomeDistribution } from "@/types/incomeDistribution";
import { FinanceUsers } from "@/types/finances";

interface DistributionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  distribution: IncomeDistribution | null;
  translations?: Record<string, any>;
}

/**
 * Modal para ver el detalle de distribución de un ingreso
 */
export const DistributionDetailModal: React.FC<DistributionDetailModalProps> = ({
  isOpen,
  onClose,
  distribution,
  translations = {},
}) => {
  if (!distribution) return null;

  const t = translations.panels?.distributionDetail || {};
  const distributionEntries = Object.entries(distribution.distributionByUser || {});

  return (
    <Modal
      open={isOpen}
      primaryButtonText={t.closeButton || "Cerrar"}
      onRequestClose={onClose}
      onRequestSubmit={onClose}
      modalHeading={`${t.title || "Distribución:"} ${distribution.concept}`}
      size="lg"
    >
      <div className="distribution-modal-content">
        <div className="phase-breakdown">
          <h3>{t.phases?.title || "📊 Fases de Distribución"}</h3>

          {/* FASE 1 */}
          <div className="phase-card">
            <h4>{t.phases?.phase1 || "Fase 1: Cobertura de Deudas"}</h4>
            <div className="phase-info">
              <div className="info-item">
                <label>{t.phase1?.totalDebtCovered || "Total Deuda Cubierta:"}:</label>
                <strong>{distribution.debtCovered.toFixed(2)}€</strong>
              </div>
              <div className="info-item">
                <label>{t.phase1?.operationalExpense || "Gastos Operativos:"}:</label>
                <strong>{distribution.operationalExpenseCovered.toFixed(2)}€</strong>
              </div>
            </div>
          </div>

          {/* FASE 2 */}
          <div className="phase-card">
            <h4>
              {t.phases?.phase2 || "Fase 2: Reserva Núcleo"} (
              {distribution.coreReservationPercentage}%)
            </h4>
            <div className="phase-info">
              <div className="info-item">
                <label>{t.phase2?.reservedAmount || "Monto Reservado:"}:</label>
                <strong>{distribution.coreReservationAmount.toFixed(2)}€</strong>
              </div>
            </div>

            {Object.keys(distribution.coreReservationByUser || {}).length > 0 && (
              <div className="user-breakdown">
                <p style={{ fontSize: "0.875rem", color: "#525252" }}>
                  {t.phase2?.assignmentByMember || "Asignación por miembro núcleo:"}
                </p>
                <ul style={{ marginTop: "0.5rem", paddingLeft: "1rem" }}>
                  {Object.entries(distribution.coreReservationByUser || {}).map(
                    ([userId, amount]) => (
                      <li key={userId} style={{ fontSize: "0.875rem", color: "#525252" }}>
                        <strong>{userId}</strong>: {(amount as number).toFixed(2)}€
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* FASE 3 */}
          <div className="phase-card">
            <h4>
              {t.phases?.phase3 || "Fase 3: Beneficio Neto"} (
              {distribution.netBenefitAmount.toFixed(2)}€)
            </h4>
            <div className="phase-info">
              <div className="info-item">
                <label>
                  {t.phase3?.equalShare || "Parte Igual"} ({distribution.equalSharePercentage}%):
                </label>
                <strong>
                  {(
                    distribution.netBenefitAmount *
                    (distribution.equalSharePercentage / 100)
                  ).toFixed(2)}
                  €
                </strong>
              </div>
              <div className="info-item">
                <label>
                  {t.phase3?.variableShare || "Parte Variable"} (
                  {distribution.variableSharePercentage}%):
                </label>
                <strong>
                  {(
                    distribution.netBenefitAmount *
                    (distribution.variableSharePercentage / 100)
                  ).toFixed(2)}
                  €
                </strong>
              </div>
            </div>
          </div>
        </div>

        <div className="distribution-table">
          <h3>{t.finalDistribution?.title || "💰 Distribución Final por Usuario"}</h3>
          <table className="distribution-table-element">
            <thead>
              <tr>
                <th>{t.finalDistribution?.headers?.user || "Usuario"}</th>
                <th>{t.finalDistribution?.headers?.debtCoverage || "Deuda Cubierta"}</th>
                <th>{t.finalDistribution?.headers?.coreReservation || "Reserva Núcleo"}</th>
                <th>{t.finalDistribution?.headers?.equalShare || "Parte Igual"}</th>
                <th>{t.finalDistribution?.headers?.variableShare || "Parte Variable"}</th>
                <th>{t.finalDistribution?.headers?.total || "Total"}</th>
              </tr>
            </thead>
            <tbody>
              {distributionEntries.map(([userId, detail]) => (
                <tr key={userId}>
                  <td>
                    <strong>{(detail as any).userName}</strong>
                  </td>
                  <td>{(detail as any).debtCoverage.toFixed(2)}€</td>
                  <td>{(detail as any).coreReservation.toFixed(2)}€</td>
                  <td>{(detail as any).equalShare.toFixed(2)}€</td>
                  <td>{(detail as any).variableShare.toFixed(2)}€</td>
                  <td>
                    <strong style={{ color: "#0f62fe" }}>
                      {(detail as any).total.toFixed(2)}€
                    </strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="info-box">
          <strong>{t.distributionDate || "📝 Fecha de Distribución:"}:</strong>{" "}
          {new Date(distribution.distributionDate).toLocaleDateString()}
        </div>
      </div>
    </Modal>
  );
};
