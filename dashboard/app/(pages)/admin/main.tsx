'use client';

import { Menu } from '@/app/components';
import { usePathname } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Auth } from '../../services/auth';
import { Layout } from '../../services/layout';
import Loader from './loading';

export default function Main({
  translations,
  children,
}: Readonly<{
  translations: Record<string, string>;
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
      {showMenu && showViewport ? (
        <Menu translations={translations}></Menu>
      ) : null}
      {showViewport ? (
        <Suspense fallback={<Loader />}>
          <div className={viewportClass}>{children}</div>
        </Suspense>
      ) : null}
    </>
  );
}
