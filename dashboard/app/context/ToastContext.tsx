"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type ToastKind = "error" | "success" | "warning" | "info";
export type ToastPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left"
  | "top-center"
  | "bottom-center";

export interface Toast {
  id: string;
  title: string;
  subtitle?: string;
  kind: ToastKind;
  position?: ToastPosition;
  duration?: number; // in milliseconds, 0 = no auto-dismiss
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const duration = toast.duration !== undefined ? toast.duration : 3000;
    const newToast: Toast = {
      ...toast,
      id,
      position: toast.position || "top-center",
      duration,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss if duration is set
    if (duration > 0) {
      setTimeout(() => {
        setToasts((current) => current.filter((t) => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAll }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
