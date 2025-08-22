'use client';

import Link from 'next/link';

import './menu.scss';
import { Auth } from '@/app/services/auth';
import { useEffect, useState } from 'react';
import { ACTIONS, STORAGE } from '@/app/constants';
import { Storage } from '@/app/services/storage';
import { Update } from '@/app/services/update';
import {
  Header,
  HeaderContainer,
  HeaderGlobalAction,
  HeaderGlobalBar,
  HeaderMenu,
  HeaderMenuButton,
  HeaderMenuItem,
  HeaderName,
  HeaderNavigation,
  HeaderSideNavItems,
  SideNav,
  SideNavItems,
  Theme,
} from '@carbon/react';
import Image from 'next/image';
import { Power, UpdateNow } from '@carbon/react/icons';
import { routes } from '@/app/(pages)/admin/routes';

export default function MenuComponent({
  translations,
}: Readonly<{
  translations: Record<string, string>;
}>) {
  const [needUpdate, setNeedUpdate] = useState(false);
  const logoutHandler = () => {
    Auth.logout();
  };

  const updateHandler = () => {
    Update.schedule();
  };

  useEffect(() => {
    setNeedUpdate(Storage.getValue(ACTIONS.DATA_UPDATE, STORAGE.LOCAL));
  }, []);

  const renderMenuItem = (route: any) => {
    return (
      <HeaderMenuItem key={route.text} href={route.path} as={Link}>
        {translations[route.text]}
      </HeaderMenuItem>
    );
  };

  const renderSubmenu = (route: any) => {
    return (
      <HeaderMenu
        key={route.text}
        aria-label={translations[route.text]}
        menuLinkName={translations[route.text]}
      >
        {route.children.map((child: any) =>
          child?.children ? renderSubmenu(child) : renderMenuItem(child)
        )}
      </HeaderMenu>
    );
  };

  return (
    <Theme theme="g100">
      <HeaderContainer
        render={({
          isSideNavExpanded,
          onClickSideNavExpand,
        }: Readonly<{
          isSideNavExpanded: boolean;
          onClickSideNavExpand: any;
        }>) => (
          <Header aria-label="Sweet Q Dashboard">
            <HeaderName prefix='' href='/admin/dashboard' as={Link}>
              <Image
                alt={'Logo'}
                className="image"
                width={100}
                height={40}
                src={'/logo-alt.svg'}
              ></Image>
            </HeaderName>
            <HeaderMenuButton
              aria-label={isSideNavExpanded ? 'Close menu' : 'Open menu'}
              onClick={onClickSideNavExpand}
              isActive={isSideNavExpanded}
              aria-expanded={isSideNavExpanded}
            />
            <HeaderNavigation aria-label="Sweet Q Dashboard">
              {routes.map((route) =>
                route?.children ? renderSubmenu(route) : renderMenuItem(route)
              )}
            </HeaderNavigation>
            <HeaderGlobalBar>
              {needUpdate ? (
                <HeaderGlobalAction onClick={updateHandler}>
                  <UpdateNow size={20} />
                </HeaderGlobalAction>
              ) : null}
              <HeaderGlobalAction onClick={logoutHandler}>
                <Power size={20} />
              </HeaderGlobalAction>
            </HeaderGlobalBar>
            <SideNav
              aria-label="Side navigation"
              expanded={isSideNavExpanded}
              isPersistent={false}
              onSideNavBlur={onClickSideNavExpand}
            >
              <SideNavItems>
                <HeaderSideNavItems>
                  {routes.map((route) =>
                    route?.children
                      ? renderSubmenu(route)
                      : renderMenuItem(route)
                  )}
                </HeaderSideNavItems>
              </SideNavItems>
            </SideNav>
          </Header>
        )}
      />
    </Theme>
  );
}
