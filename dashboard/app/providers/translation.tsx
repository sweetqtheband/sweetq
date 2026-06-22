"use client";

import { createContext, useState, useContext, useEffect, useMemo } from "react";

export interface TranslationContextType {
  translations: Record<string, string>;
  setTranslations: (translations: Record<string, string>) => void;
}

interface TranslationProviderProps {
  children: React.ReactNode;
  translations?: Record<string, string>;
}

const TranslationContext = createContext<TranslationContextType | null>(null);

export function TranslationProvider({ children, translations = {} }: TranslationProviderProps) {
  const [currentTranslations, setCurrentTranslations] = useState(translations);

  const translationState = useMemo<TranslationContextType>(
    () => ({
      translations: currentTranslations,
      setTranslations: (newTranslations) =>
        setCurrentTranslations((prev) => ({ ...prev, ...newTranslations })),
    }),
    [currentTranslations]
  );

  return (
    <TranslationContext.Provider value={translationState}>{children}</TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
}
