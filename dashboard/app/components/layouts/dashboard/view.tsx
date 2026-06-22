"use client";
import { useMainView } from "@/app/providers/mainView";
import { useEffect } from "react";
import { createAside } from "@/app/helpers/dashboard";
import { Aside } from "@/types/aside";
import { usePathname } from "next/navigation";
interface DashboardViewProps {
  children: React.ReactNode;
  aside?: Aside;
  layoutRoutes?: string[];
}

const renderAside = (aside?: Aside, position?: "before" | "after" | "main") => {
  if (aside) {
    return (aside[position || "after"] || []).map((item, key) => (
      <div key={`${position || "after"}${key}`}>{item.component}</div>
    ));
  }
  return null;
};

const renderAsideBefore = (aside?: Aside) => {
  if (aside && aside.before.length > 0) {
    return <div className="aside-before">{renderAside(aside, "before")}</div>;
  }
  return null;
};

const renderAsideAfter = (aside?: Aside) => {
  if (aside && aside.after.length > 0) {
    return <div className="aside-after">{renderAside(aside, "after")}</div>;
  }
  return null;
};

const renderAsideMain = (aside?: Aside) => {
  if (aside && aside.main.length > 0) {
    return <div className="aside-main">{renderAside(aside, "main")}</div>;
  }
  return null;
};
export default function DashboardView({ children, layoutRoutes = [], aside }: DashboardViewProps) {
  const { setHideMenu } = useMainView();

  const pathname = usePathname();
  const isLayoutRoute = layoutRoutes.includes(pathname);

  useEffect(() => {
    if (isLayoutRoute) {
      setHideMenu(true);
    } else {
      setHideMenu(false);
    }
  }, [setHideMenu, pathname, isLayoutRoute]);

  const { setAside } = createAside();
  setAside(aside ? aside : { before: [], after: [], main: [] });

  return (
    <div>
      <div className="dashboard-layout">
        <aside>
          {renderAsideBefore(aside)}
          {renderAsideMain(aside)}
          {renderAsideAfter(aside)}
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
