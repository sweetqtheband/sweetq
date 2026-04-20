"use client";

import { useEffect } from "react";

export default function StyleToHead() {
  useEffect(() => {
    // Buscar todos los styles con data-dynamic-style
    const dynamicStyles = document.querySelectorAll("style[data-dynamic-style='true']");

    dynamicStyles.forEach((style) => {
      if (style.parentNode !== document.head) {
        document.head.appendChild(style);
      }
    });
  }, []);

  return null;
}
