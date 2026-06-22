"use client";

import { createContext, useState, useContext, useEffect, useMemo, Suspense } from "react";
import { Auth } from "@/app/services/auth";
import { Layout } from "@/app/services/layout";
import { usePathname } from "next/navigation";
import Loader from "@/app/(pages)/admin/loading";
import { Menu } from "@/app/components";
import { getClasses, setClasses } from "@/app/utils";

export interface MainViewContextType {
  showMenu: boolean;
  showViewport: boolean;
  hideMenu?: boolean;
  setShowMenu: (showMenu: boolean) => void;
  setShowViewport: (showViewport: boolean) => void;
  setHideMenu: (hideMenu: boolean) => void;
}

interface MainViewProviderProps {
  translations: any;
  children: React.ReactNode;
}

const MainViewContext = createContext<MainViewContextType | null>(null);

export function MainViewProvider({ translations, children }: MainViewProviderProps) {
  const pathname = usePathname();

  const [showMenu, setShowMenu] = useState(false);
  const [showViewport, setShowViewport] = useState(false);
  const [hideMenu, setHideMenu] = useState(false);

  const mainViewState = useMemo<MainViewContextType>(
    () => ({
      showMenu,
      showViewport,
      hideMenu,
      setShowMenu,
      setShowViewport,
      setHideMenu,
    }),
    [showMenu, showViewport, hideMenu]
  );

  useEffect(() => {
    setShowMenu(Layout.hasAdminMenu(pathname));
    setShowViewport(!Layout.hasAdminMenu(pathname));
  }, [pathname]);

  useEffect(() => {
    const authValid = async () => {
      const isAuth = await Auth.isAuth();
      setShowViewport(Layout.isAdmin(pathname) && isAuth);
    };
    if (showMenu) {
      authValid();
    }
  }, [showMenu, pathname]);

  const classes = {
    viewport: true,
    "with-menu": showMenu,
    "hide-menu": hideMenu,
  };

  const viewportClass = getClasses(classes);
  return (
    <MainViewContext.Provider value={mainViewState}>
      {showMenu && showViewport ? <Menu translations={translations}></Menu> : null}
      {showViewport ? (
        <Suspense fallback={<Loader />}>
          <div className={viewportClass}>{children}</div>
        </Suspense>
      ) : null}
    </MainViewContext.Provider>
  );
}

export function useMainView(): MainViewContextType {
  const context = useContext(MainViewContext);
  if (!context) {
    throw new Error("useMainView must be used within a MainViewProvider");
  }
  return context;
}

export default MainViewProvider;
