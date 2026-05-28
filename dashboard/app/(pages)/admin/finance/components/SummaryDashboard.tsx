import React from "react";
import { IncomeDistribution } from "@/types/incomeDistribution";
import { FinanceUsers } from "@/types/finances";

interface SummaryDashboardProps {
  distributions: IncomeDistribution[];
  users: FinanceUsers[];
  translations?: Record<string, any>;
}

/**
 * Dashboard de Resumen - Muestra balances consolidados por usuario
 */
export const SummaryDashboard: React.FC<SummaryDashboardProps> = ({
  distributions,
  users,
  translations = {},
}) => {
  const t = translations.panels?.summary || {};
  // Consolidar balances por usuario
  const balanceByUser: Record<string, number> = {};
  const detailsByUser: Record<
    string,
    {
      totalDebtCoverage: number;
      totalCoreReservation: number;
      totalEqualShare: number;
      totalVariableShare: number;
    }
  > = {};

  for (const distribution of distributions) {
    for (const [userId, detail] of Object.entries(distribution.distributionByUser || {})) {
      if (!balanceByUser[userId]) {
        balanceByUser[userId] = 0;
        detailsByUser[userId] = {
          totalDebtCoverage: 0,
          totalCoreReservation: 0,
          totalEqualShare: 0,
          totalVariableShare: 0,
        };
      }

      balanceByUser[userId] += detail.total;
      detailsByUser[userId].totalDebtCoverage += detail.debtCoverage;
      detailsByUser[userId].totalCoreReservation += detail.coreReservation;
      detailsByUser[userId].totalEqualShare += detail.equalShare;
      detailsByUser[userId].totalVariableShare += detail.variableShare;
    }
  }

  const getSortedUsers = () => {
    return users.sort((a, b) => {
      const balanceA = balanceByUser[String(a._id)] || 0;
      const balanceB = balanceByUser[String(b._id)] || 0;
      return balanceB - balanceA;
    });
  };

  return (
    <div className="summary-dashboard">
      <div className="summary-header">
        <h2>{t.title || "💰 Resumen de Balances"}</h2>
        <p>{t.subtitle || "Consolidado de todas las distribuciones"}</p>
      </div>

      <div className="balances-section">
        <h3>{t.sections?.balanceByMember || "Balance por Miembro"}</h3>
        <table className="balances-table">
          <thead>
            <tr>
              <th>{t.table?.headers?.user || "Usuario"}</th>
              <th>{t.table?.headers?.debtCoverage || "Cobertura Deuda"}</th>
              <th>{t.table?.headers?.coreReservation || "Reserva Núcleo"}</th>
              <th>{t.table?.headers?.equalShare || "Parte Igual"}</th>
              <th>{t.table?.headers?.variableShare || "Parte Variable"}</th>
              <th>{t.table?.headers?.total || "Total"}</th>
            </tr>
          </thead>
          <tbody>
            {getSortedUsers().map((user) => {
              const userId = String(user._id);
              const balance = balanceByUser[userId] || 0;
              const details = detailsByUser[userId];

              return (
                <tr key={userId}>
                  <td>
                    <div className="user-cell">
                      <strong>{user.name}</strong>
                      <span className="member-type">
                        {user.memberType === "core"
                          ? t.table?.memberType?.core || "🔴 NÚCLEO"
                          : t.table?.memberType?.operative || "🔵 OPERATIVO"}
                      </span>
                    </div>
                  </td>
                  <td>{details?.totalDebtCoverage.toFixed(2)}€</td>
                  <td>{details?.totalCoreReservation.toFixed(2)}€</td>
                  <td>{details?.totalEqualShare.toFixed(2)}€</td>
                  <td>{details?.totalVariableShare.toFixed(2)}€</td>
                  <td>
                    <strong
                      style={{
                        color: balance > 0 ? "#24a148" : balance < 0 ? "#da1e28" : "#525252",
                        fontSize: "1.125rem",
                      }}
                    >
                      {balance > 0 ? "+" : ""}
                      {balance.toFixed(2)}€
                    </strong>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="stats-section">
        <div className="stat-card">
          <h4>{t.cards?.toDistribute || "Total a Distribuir"}</h4>
          <p className="stat-value">
            {Object.values(balanceByUser)
              .reduce((sum, b) => sum + Math.max(0, b), 0)
              .toFixed(2)}
            €
          </p>
        </div>

        <div className="stat-card">
          <h4>{t.cards?.distributionsProcessed || "Distribuciones Procesadas"}</h4>
          <p className="stat-value">{distributions.length}</p>
        </div>

        <div className="stat-card">
          <h4>{t.cards?.coreMembers || "Miembros Núcleo"}</h4>
          <p className="stat-value">{users.filter((u) => u.memberType === "core").length}</p>
        </div>

        <div className="stat-card">
          <h4>{t.cards?.operativeMembers || "Miembros Operativos"}</h4>
          <p className="stat-value">{users.filter((u) => u.memberType === "operative").length}</p>
        </div>
      </div>

      <div className="distributions-section">
        <h3>{t.sections?.distributions || "Detalle de Distribuciones"}</h3>
        {distributions.length === 0 ? (
          <p style={{ color: "#525252" }}>
            {t.table?.noDistributions || "No hay distribuciones registradas"}
          </p>
        ) : (
          <div className="distributions-list">
            {distributions.map((dist) => (
              <div key={dist._id} className="distribution-card">
                <div className="card-header">
                  <h4>{dist.concept}</h4>
                  <span className="date">
                    {new Date(dist.distributionDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="card-stats">
                  <div className="stat">
                    <label>{t.distribution?.debtCovered || "Deuda Cubierta:"}:</label>
                    <strong>{dist.debtCovered.toFixed(2)}€</strong>
                  </div>
                  <div className="stat">
                    <label>
                      {t.distribution?.coreReservation || "Reserva Núcleo"} (
                      {dist.coreReservationPercentage}%):
                    </label>
                    <strong>{dist.coreReservationAmount.toFixed(2)}€</strong>
                  </div>
                  <div className="stat">
                    <label>{t.distribution?.netBenefit || "Beneficio Neto:"}:</label>
                    <strong>{dist.netBenefitAmount.toFixed(2)}€</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
