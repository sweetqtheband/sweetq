"use client";

import { useMainView } from "@/app/providers/mainView";
import "./main.scss";

export default function Main({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { setHideMenu } = useMainView();
  setHideMenu(false);
  return <>{children}</>;
}
