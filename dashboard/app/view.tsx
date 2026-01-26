"use client";
import { useEffect, useState } from "react";
import { WindowContext } from "./context";
import { getClasses, isMobile } from "./utils";

export default function RootView({ children }: { children: React.ReactNode }) {
  const [classes, setClasses] = useState("");
  const [windowState, setWindowState] = useState({
    open: false,
    resizing: false,
  });

  useEffect(() => {
    const adjustVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    adjustVH();
    window.addEventListener("resize", adjustVH);
    return () => window.removeEventListener("resize", adjustVH);
  }, []);

  useEffect(() => {
    const resizeHandler = () => {
      setWindowState((prev) => ({ ...prev, resizing: true }));
      setTimeout(() => setWindowState((prev) => ({ ...prev, resizing: false })), 1000);
    };

    window.addEventListener("resize", resizeHandler);
    setClasses(getClasses({ mobile: isMobile() }));

    return () => window.removeEventListener("resize", resizeHandler);
  }, []);

  useEffect(() => {
    const onClickHandle = () => {
      setWindowState((prev) => ({ ...prev, open: true }));
    };

    document.documentElement.addEventListener("click", onClickHandle);

    return () => {
      document.documentElement.removeEventListener("click", onClickHandle);
    };
  }, []);

  return (
    <WindowContext.Provider value={windowState}>
      <div className={classes}>{children}</div>
    </WindowContext.Provider>
  );
}
