"use client";

import { useEffect } from "react";

interface CSSVarsProps {
  name: string;
  value: string;
}

export default function CSSVars({ name, value }: Readonly<CSSVarsProps>) {
  useEffect(() => {
    document.documentElement.style.setProperty(`--${name}`, value);
  }, [name, value]);

  return null;
}
