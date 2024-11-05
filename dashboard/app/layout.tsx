'use client';
import { SetStateAction, useEffect, useState } from 'react';
import { WindowContext } from './context';
import './reset.css';
import './globals.css';

let resizeTimeout: any = null;
let isResizing = false;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [windowState, setWindowState] = useState({
    open: false,
    resizing: false,
  });
  const onClickHandle = (e: any) => {
    const state = {
      ...windowState,
      open: true,
    };
    setWindowState(state);
  };

  useEffect(() => {
    const handleResize = (
      state: SetStateAction<{ open: boolean; resizing: boolean }>
    ) => setWindowState(state);

    window.addEventListener('resize', (e: any) => {
      e.preventDefault();
      if (!isResizing) {
        isResizing = true;

        const state = {
          ...windowState,
          resizing: true,
        };

        handleResize(state);
      } else {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          const state = {
            ...windowState,
            resizing: false,
          };
          handleResize(state);
          isResizing = false;
        }, 1000);
      }
    });
  }, [windowState]);

  return (
    <WindowContext.Provider value={windowState}>
      <html lang="es" onClick={onClickHandle}>
        <head>
          <link
            rel="icon"
            type="image/x-icon"
            href="/favicons/favicon.ico"
          ></link>
          <link
            rel="apple-touch-icon"
            sizes="57x57"
            href="/favicons/apple-icon-57x57.png"
          ></link>
          <link
            rel="apple-touch-icon"
            sizes="60x60"
            href="/favicons/apple-icon-60x60.png"
          ></link>
          <link
            rel="apple-touch-icon"
            sizes="72x72"
            href="/favicons/apple-icon-72x72.png"
          ></link>
          <link
            rel="apple-touch-icon"
            sizes="76x76"
            href="/favicons/apple-icon-76x76.png"
          ></link>
          <link
            rel="apple-touch-icon"
            sizes="114x114"
            href="/favicons/apple-icon-114x114.png"
          ></link>
          <link
            rel="apple-touch-icon"
            sizes="120x120"
            href="/favicons/apple-icon-120x120.png"
          ></link>
          <link
            rel="apple-touch-icon"
            sizes="144x144"
            href="/favicons/apple-icon-144x144.png"
          ></link>
          <link
            rel="apple-touch-icon"
            sizes="152x152"
            href="/favicons/apple-icon-152x152.png"
          ></link>
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/favicons/apple-icon-180x180.png"
          ></link>
          <link
            rel="icon"
            type="image/png"
            sizes="192x192"
            href="/favicons/android-icon-192x192.png"
          ></link>
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicons/favicon-32x32.png"
          ></link>
          <link
            rel="icon"
            type="image/png"
            sizes="96x96"
            href="/favicons/favicon-96x96.png"
          ></link>
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicons/favicon-16x16.png"
          ></link>
        </head>
        <body>{children}</body>
      </html>
    </WindowContext.Provider>
  );
}
