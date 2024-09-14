"use client";

import { Menu } from "@/app/components";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Auth } from "../services/auth";


export default function Main({children}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);
  const [showViewport, setShowViewport] = useState(false);

  useEffect(() => { 
    setShowMenu(pathname !== "/login");
    setShowViewport(pathname === "/login");
  }, [pathname]);

  useEffect(() => {
    const authValid = async () => {
      const isAuth = await Auth.isAuth();
      setShowViewport(pathname !== "/login" && isAuth);
    }
    if (showMenu) {
      authValid();
    }
  }, [showMenu, pathname]);
  return (
    <>
      {showMenu && showViewport ? <Menu></Menu> : null}
      {showViewport ? <div className="viewport">{children}</div> : null }
    </>
  );
}
