"use client";

import { createContext, useState, useContext, useEffect, useMemo } from "react";

const iconsetCache: Record<string, Record<string, React.ComponentType<any>>> = {};

export interface ThemeContextType {
  theme: string;
  mode: string;
  iconset: Record<string, React.ComponentType<any>>;
  setTheme: (theme: string) => void;
  setMode: (mode: string) => void;
  setIconset: (iconset: Record<string, React.ComponentType<any>>) => void;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sq-theme") || "sweetq";
    }
    return "sweetq";
  });

  const [mode, setMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sq-mode") || "light";
    }
    return "light";
  });

  const [iconset, setIconset] = useState<Record<string, React.ComponentType<any>>>({});

  const themeState = useMemo<ThemeContextType>(
    () => ({
      theme,
      mode,
      iconset,
      setTheme,
      setMode,
      setIconset,
    }),
    [theme, mode, iconset]
  );

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    document.body.setAttribute("data-mode", mode);

    localStorage.setItem("sq-theme", theme);
    localStorage.setItem("sq-mode", mode);
  }, [theme, mode]);

  import(`@/app/themes/${theme}.scss`);

  useEffect(() => {
    const loadIconset = async () => {
      if (iconsetCache[theme]) {
        setIconset(iconsetCache[theme]);
        return;
      }

      try {
        const icons = await import(`@/app/themes/icons`);

        // Filter out module properties and keep only valid React components
        const iconComponents: Record<string, React.ComponentType<any>> = {};
        for (const [key, value] of Object.entries(icons)) {
          if (key !== "__esModule" && typeof value === "function") {
            iconComponents[key] = value as React.ComponentType<any>;
          }
        }
        iconsetCache[theme] = iconComponents;
        setIconset(iconComponents);
      } catch (error) {
        console.error(`[ThemeProvider] Error loading iconset for theme: ${theme}`, error);
      }
    };

    loadIconset();
  }, [theme]);

  return <ThemeContext.Provider value={themeState}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export default ThemeProvider;
