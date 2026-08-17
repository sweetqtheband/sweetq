"use client";

import { createContext, useState, useContext, ReactNode, useRef } from "react";

export interface NavigationContextType {
  isNavigating: boolean;
  setIsNavigating: (value: boolean) => void;
  finishNavigation: () => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

interface NavigationProviderProps {
  children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const filterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutDelay = 1000;
  const [isNavigating, setIsNavigating] = useState(false);

  const navigationState: NavigationContextType = {
    isNavigating,
    setIsNavigating,
    finishNavigation: () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
      }
      filterTimeoutRef.current = setTimeout(() => setIsNavigating(false), timeoutDelay);
    },
  };

  return (
    <NavigationContext.Provider value={navigationState}>{children}</NavigationContext.Provider>
  );
}

export function useNavigation(): NavigationContextType {
  const context = useContext(NavigationContext);

  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }

  return context;
}
