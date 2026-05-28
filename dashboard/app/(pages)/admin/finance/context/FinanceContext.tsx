"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { FinanceUsers } from "@/types/finances";

interface FinanceContextType {
  currentFinanceUser: FinanceUsers | null;
  financeUsers: FinanceUsers[];
  loading: boolean;
  error: string | null;
  refreshUsers: () => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [currentFinanceUser, setCurrentFinanceUser] = useState<FinanceUsers | null>(null);
  const [financeUsers, setFinanceUsers] = useState<FinanceUsers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/finance/users");
      if (!res.ok) throw new Error("Error cargando usuarios");
      const data = await res.json();
      setFinanceUsers(data.data || []);

      // Si hay usuarios, seleccionar el primero como default
      if (data.data && data.data.length > 0) {
        setCurrentFinanceUser(data.data[0]);
      }
    } catch (err: any) {
      setError(err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  return (
    <FinanceContext.Provider
      value={{ currentFinanceUser, financeUsers, loading, error, refreshUsers }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance debe usarse dentro de FinanceProvider");
  }
  return context;
}
