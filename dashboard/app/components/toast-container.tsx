"use client";

import React from "react";
import { InlineNotification } from "@carbon/react";
import { useToast } from "@/app/context/ToastContext";
import "./toast-container.scss";

/**
 * Global Toast Container Component
 * Renders toasts with fixed positioning throughout the application
 */
export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  // Group toasts by position
  const toastsByPosition = toasts.reduce(
    (acc, toast) => {
      const pos = toast.position || "top-center";
      if (!acc[pos]) {
        acc[pos] = [];
      }
      acc[pos].push(toast);
      return acc;
    },
    {} as Record<string, typeof toasts>
  );

  return (
    <div className="toast-container">
      {Object.entries(toastsByPosition).map(([position, positionToasts]) => (
        <div key={position} className={`toast-stack toast-${position}`}>
          {positionToasts.map((toast) => (
            <div key={toast.id} className="toast-item">
              <InlineNotification
                kind={toast.kind}
                title={toast.title}
                subtitle={toast.subtitle}
                onClose={() => removeToast(toast.id)}
                lowContrast={true}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
