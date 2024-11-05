'use client';

import { Menu } from '@/app/components';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Auth } from '../../services/auth';
import { Layout } from '../../services/layout';

export default function Main({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);
  const [showViewport, setShowViewport] = useState(false);

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

  const viewportClass = showMenu ? 'viewport with-menu' : 'viewport';
  return (
    <>
      {showMenu && showViewport ? <Menu></Menu> : null}
      {showViewport ? <div className={viewportClass}>{children}</div> : null}
    </>
  );
}
