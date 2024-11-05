'use client';

import { Route } from '@/types/route.d';
import Link from 'next/link';

import './menu.scss';
import Image from 'next/image';
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
  HeaderMenuButton,
  HeaderMenuItem,
  HeaderNavigation,
  HeaderSideNavItems,
  SideNav,
  SideNavItems,
  SkipToContent,
  Theme,
} from '@carbon/react';
import { Power, UpdateNow } from '@carbon/react/icons';

export default function MenuComponent() {
  const routes: Route[] = [
    {
      text: 'Instagram',
      path: '/admin/instagram',
    },
    {
      text: 'Gmail',
      path: '/admin/gmail',
    },
    {
      text: 'Tracks',
      path: '/admin/tracks',
    },
  ];

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

  return (
    <Theme theme="g100">
      <HeaderContainer
        render={({ isSideNavExpanded, onClickSideNavExpand }) => (
          <Header aria-label="Sweet Q Dashboard">
            <HeaderMenuButton
              aria-label={isSideNavExpanded ? 'Close menu' : 'Open menu'}
              onClick={onClickSideNavExpand}
              isActive={isSideNavExpanded}
              aria-expanded={isSideNavExpanded}
            />
            <HeaderNavigation aria-label="Sweet Q Dashboard">
              {routes.map((route) => (
                <HeaderMenuItem key={route.path} href={route.path} as={Link}>
                  {route.text}
                </HeaderMenuItem>
              ))}
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
                  {routes.map((route) => (
                    <HeaderMenuItem
                      key={route.path}
                      href={route.path}
                      as={Link}
                    >
                      {route.text}
                    </HeaderMenuItem>
                  ))}
                </HeaderSideNavItems>
              </SideNavItems>
            </SideNav>
          </Header>
        )}
      />
    </Theme>
  );
}
