"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Tabs, TabList, Tab, TabPanels, TabPanel, Button } from "@carbon/react";
import {
  PaymentPanel,
  ExpenseDetailPanel,
  CreateExpensePanel,
  CreateIncomePanel,
  SummaryDashboard,
  DistributionDetailModal,
} from "../components";
import ListLayout from "@/app/components/layouts/list-layout";
import { FinanceProvider, useFinance } from "../context/FinanceContext";
import { Expenses } from "@/app/services/expenses";
import { Incomes } from "@/app/services/incomes";
import { FinanceUsers } from "@/app/services/financeUsers";
import { FinancePayments } from "@/app/services/financePayments";
import { Expenses as ExpensesType } from "@/types/expense";
import { Incomes as IncomesType } from "@/types/income";
import {
  FinanceUsers as FinanceUsersType,
  CreatePaymentRecordRequest,
  CreateExpenseRequest,
  CreateIncomeRequest,
} from "@/types/finances";
import { IncomeDistribution } from "@/types/incomeDistribution";
import { FINANCE_PANEL_ACTIONS, type FinancePanelAction } from "../constants";
import Loader from "../../loading";

interface FinanceOperationsClientProps {
  translations?: Record<string, any>;
  expensesLayoutConfig?: Record<string, any>;
  expensesFields?: Record<string, any>;
  incomesLayoutConfig?: Record<string, any>;
  incomesFields?: Record<string, any>;
}

function FinanceOperationsContent({
  translations = {},
  expensesLayoutConfig = {},
  expensesFields = {},
  incomesLayoutConfig = {},
  incomesFields = {},
}: FinanceOperationsClientProps) {
  const { currentFinanceUser } = useFinance();
  const [expenses, setExpenses] = useState<ExpensesType[]>([]);
  const [incomes, setIncomes] = useState<IncomesType[]>([]);
  const [users, setUsers] = useState<FinanceUsersType[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [distributions, setDistributions] = useState<IncomeDistribution[]>([]);

  const [loading, setLoading] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpensesType | null>(null);
  const [selectedIncome, setSelectedIncome] = useState<IncomesType | null>(null);
  const [selectedDistribution, setSelectedDistribution] = useState<IncomeDistribution | null>(null);

  const [openPanel, setOpenPanel] = useState<FinancePanelAction | "">("");
  const [distributionDetailOpen, setDistributionDetailOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpensesType | null>(null);
  const [editingIncome, setEditingIncome] = useState<IncomesType | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [expensesRes, incomesRes, usersRes] = await Promise.all([
        Expenses.getAll({ limit: 1000 }),
        Incomes.getAll({ limit: 1000 }),
        FinanceUsers.getAll({ limit: 1000 }),
      ]);

      setExpenses(expensesRes.items || []);
      setIncomes(incomesRes.items || []);
      setUsers(usersRes.items || []);

      const incomeIds = (incomesRes.items || []).map((income: IncomesType) => String(income._id));
      const distributions = await FinancePayments.getDistributions(incomeIds);
      setDistributions(distributions.map((res: any) => res.data));
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateExpense = async (data: CreateExpenseRequest) => {
    try {
      if (editingExpense) {
        await Expenses.put(String(editingExpense._id), data);
      } else {
        await Expenses.post({ ...data, createdBy: currentFinanceUser?._id });
      }

      await loadData();
      setOpenPanel("");
      setEditingExpense(null);
    } catch (err: any) {
      throw new Error(err?.message || translations.errors.unknown);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm(translations.messages.deleteExpenseConfirm)) return;

    try {
      await Expenses.delete(id);
      await loadData();
      setSelectedExpense(null);
    } catch (err: any) {
      alert(`Error: ${err?.message}`);
    }
  };

  const handleDeleteExpenses = useCallback(
    async (ids: string[]) => {
      try {
        await Promise.all(ids.map((id) => Expenses.delete(id)));
        await loadData();
        setSelectedExpense(null);
      } catch (err: any) {
        throw new Error(err?.message || translations.errors.unknown);
      }
    },
    [loadData, translations.errors.unknown]
  );

  const handleCreateIncome = async (data: CreateIncomeRequest) => {
    try {
      if (editingIncome) {
        await Incomes.put(String(editingIncome._id), data);
      } else {
        await Incomes.post(data);
      }

      await loadData();
      setOpenPanel("");
      setEditingIncome(null);
    } catch (err: any) {
      throw new Error(err?.message || translations.errors.unknown);
    }
  };

  const handleDeleteIncome = async (id: string) => {
    if (!confirm(translations.messages.deleteIncomeConfirm)) return;

    try {
      await Incomes.delete(id);
      await loadData();
      setSelectedIncome(null);
    } catch (err: any) {
      alert(`Error: ${err?.message}`);
    }
  };

  const handleDeleteIncomes = useCallback(
    async (ids: string[]) => {
      try {
        await Promise.all(ids.map((id) => Incomes.delete(id)));
        await loadData();
        setSelectedIncome(null);
      } catch (err: any) {
        throw new Error(err?.message || translations.errors.unknown);
      }
    },
    [loadData, translations.errors.unknown]
  );

  const handleRegisterPayment = async (expenseId: string, data: CreatePaymentRecordRequest) => {
    try {
      await FinancePayments.registerPayment(expenseId, data);
      await loadData();
      setOpenPanel("");
    } catch (err: any) {
      throw new Error(err?.message || translations.errors.unknown);
    }
  };

  const handleShowDistribution = async (income: IncomesType) => {
    const dist = distributions.find((d) => d.incomeId === String(income._id));
    if (dist) {
      setSelectedDistribution(dist);
      setDistributionDetailOpen(true);
    } else {
      alert(translations.messages.distributionNotCalculated);
    }
  };

  // Methods for ListLayout - Expenses
  const expensesMethods = useCallback(
    () => ({
      onFilterSave: async (filters: Record<string, any>) => {
        // Filtros se aplican en el lado del cliente por ahora
        return "";
      },
      onSave: async (data: any, files: any, ids: string[] | null) => {
        return false;
      },
      onDelete: async (ids: string[]) => {
        await handleDeleteExpenses(ids);
        return true;
      },
      onCopy: async (ids: string[]) => {
        return false;
      },
    }),
    [handleDeleteExpenses]
  );

  // Methods for ListLayout - Incomes
  const incomesMethods = useCallback(
    () => ({
      onFilterSave: async (filters: Record<string, any>) => {
        // Filtros se aplican en el lado del cliente por ahora
        return "";
      },
      onSave: async (data: any, files: any, ids: string[] | null) => {
        return false;
      },
      onDelete: async (ids: string[]) => {
        await handleDeleteIncomes(ids);
        return true;
      },
      onCopy: async (ids: string[]) => {
        return false;
      },
    }),
    [handleDeleteIncomes]
  );

  return (
    <div className="finance-operations-page cds--data-table-container">
      <div className="cds--data-table-header">
        <h2 className="cds--data-table-header__title">{translations.title}</h2>
        <p className="cds--data-table-header__description">{translations.description}</p>
      </div>

      <Tabs>
        <TabList aria-label={translations.sections}>
          <Tab>{translations.tabs.expenses}</Tab>
          <Tab>{translations.tabs.incomes}</Tab>
          <Tab>{translations.tabs.summary}</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            {loading ? (
              <Loader />
            ) : (
              <>
                <ListLayout
                  items={expenses}
                  headers={expensesLayoutConfig.headers}
                  fields={expensesFields}
                  methods={expensesMethods()}
                  onItemSelect={setSelectedExpense}
                  onAction={() => {
                    setEditingExpense(null);
                    setOpenPanel(FINANCE_PANEL_ACTIONS.CREATE_EXPENSE);
                  }}
                  noAdd={false}
                  noDelete={false}
                  noBatchActions={false}
                  translations={translations}
                  pages={Math.ceil(expenses.length / 25)}
                  limit={25}
                  loading={loading}
                  setExternalLoading={setLoading}
                />

                {selectedExpense && (
                  <div className="detail-panel-container">
                    <div className="panel-actions">
                      <Button
                        kind="tertiary"
                        size="sm"
                        onClick={() => {
                          setEditingExpense(selectedExpense);
                          setOpenPanel(FINANCE_PANEL_ACTIONS.CREATE_EXPENSE);
                        }}
                      >
                        {translations.buttons.edit}
                      </Button>
                      <Button
                        kind="danger--tertiary"
                        size="sm"
                        onClick={() => handleDeleteExpense(String(selectedExpense._id))}
                      >
                        {translations.buttons.delete}
                      </Button>
                    </div>

                    <div className="tab-content">
                      <ExpenseDetailPanel
                        expense={selectedExpense}
                        payments={payments}
                        onRegisterPayment={() => setOpenPanel(FINANCE_PANEL_ACTIONS.PAYMENT)}
                        users={users}
                        translations={translations}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </TabPanel>

          <TabPanel>
            {loading ? (
              <Loader />
            ) : (
              <>
                <ListLayout
                  items={incomes}
                  headers={incomesLayoutConfig.headers}
                  fields={incomesFields}
                  methods={incomesMethods()}
                  onItemSelect={setSelectedIncome}
                  onAction={() => {
                    setEditingIncome(null);
                    setOpenPanel(FINANCE_PANEL_ACTIONS.CREATE_INCOME);
                  }}
                  noAdd={false}
                  noDelete={false}
                  noBatchActions={false}
                  translations={translations}
                  pages={Math.ceil(incomes.length / 25)}
                  limit={25}
                  loading={loading}
                  setExternalLoading={setLoading}
                />

                {selectedIncome && (
                  <div className="income-actions-panel">
                    <Button
                      kind="primary"
                      size="sm"
                      onClick={() => handleShowDistribution(selectedIncome)}
                    >
                      {translations.buttons.viewDistribution}
                    </Button>
                    <Button
                      kind="tertiary"
                      size="sm"
                      onClick={() => {
                        setEditingIncome(selectedIncome);
                        setOpenPanel(FINANCE_PANEL_ACTIONS.CREATE_INCOME);
                      }}
                    >
                      {translations.buttons.edit}
                    </Button>
                    <Button
                      kind="danger--tertiary"
                      size="sm"
                      onClick={() => handleDeleteIncome(String(selectedIncome._id))}
                    >
                      {translations.buttons.delete}
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabPanel>

          <TabPanel>
            <div className="tab-content">
              {loading ? (
                <div>{translations.messages.loading}</div>
              ) : (
                <SummaryDashboard
                  distributions={distributions}
                  users={users}
                  translations={translations}
                />
              )}
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <PaymentPanel
        open={openPanel}
        setOpen={setOpenPanel}
        onSubmit={handleRegisterPayment}
        selectedExpense={selectedExpense}
        users={users}
        translations={translations}
      />

      <CreateExpensePanel
        open={openPanel}
        setOpen={setOpenPanel}
        onSubmit={handleCreateExpense}
        editingExpense={editingExpense}
        translations={translations}
      />

      <CreateIncomePanel
        open={openPanel}
        setOpen={setOpenPanel}
        onSubmit={handleCreateIncome}
        editingIncome={editingIncome}
        translations={translations}
      />

      <DistributionDetailModal
        isOpen={distributionDetailOpen}
        onClose={() => setDistributionDetailOpen(false)}
        distribution={selectedDistribution}
        translations={translations}
      />
    </div>
  );
}

export default function FinanceOperationsClient(props: FinanceOperationsClientProps) {
  return (
    <FinanceProvider>
      <FinanceOperationsContent {...props} />
    </FinanceProvider>
  );
}
