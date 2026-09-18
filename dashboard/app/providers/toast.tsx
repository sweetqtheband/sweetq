"use client"

import { useState } from "react";
import { ToastContext, type Toast } from "@/app/hooks/toast";
import { InlineNotification } from "@carbon/react/lib/components/Notification/Notification";
import { uuid } from "@/app/utils";

function useToastState() {
    const [toasts, setToasts] = useState<Array<Toast>>([]);

    const addToast = ({ kind, lowContrast, role, statusIconDescription, title, subtitle }: Omit<Toast, "id">) => {
        const id = uuid();
        setToasts((prevToasts) => [...prevToasts, { id, kind, lowContrast, role, statusIconDescription, title, subtitle }]);
        return id;
    };

    const updateToast = (id: string, updatedToast: Partial<Toast>) => {
        setToasts((prevToasts) =>
            prevToasts.map((toast) => (toast.id === id ? { ...toast, ...updatedToast } : toast))
        );
    };

    return { toasts, addToast, updateToast };
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const toastState = useToastState();

    return (
        <ToastContext.Provider value={toastState}>
            {children}
            <div className="toast-container">
                {toastState.toasts.map((toast: Toast) => (
                    <InlineNotification
                        key={toast.id}
                        kind={toast.kind || "info"}
                        lowContrast={toast.lowContrast || true}
                        role={toast.role}
                        statusIconDescription={toast.statusIconDescription}
                        subtitle={toast.subtitle}
                        title={toast.title}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
}