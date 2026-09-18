import { createContext, useContext } from "react";

export interface Toast {
    id: string;
    kind: "error" | "info" | "success" | "warning";
    lowContrast: boolean;
    role: "status" | "alert" | "log";
    statusIconDescription?: string;
    title?: string;
    subtitle?: string
}

export interface ToastContextType {
    toasts: Array<Toast>;
    addToast: (toast: Omit<Toast, "id">) => string;
    updateToast: (id: string, updatedToast: Partial<Toast>) => void;
}

export const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }

    return context;
};
