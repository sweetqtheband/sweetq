'use client';

import { IG, STORAGE } from '@/app/constants';
import { useEventBus } from '@/app/hooks/event';
import { instagram } from '@/app/services/instagram';
import { Storage } from '@/app/services/storage';
import Script from 'next/script';
import { useCallback, useEffect, useRef } from 'react';

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: Function;
  }
}

const isExpired = () => {
  const expires = Storage.getValue(IG.EXPIRES, STORAGE.LOCAL);
  if (expires) {
    const now = new Date().getTime();
    const expiration = new Date(Number(expires)).getTime() * 1000;
    if (now > expiration) {
      Storage.removeValue(IG.TOKEN, STORAGE.LOCAL);
      Storage.removeValue(IG.EXPIRES, STORAGE.LOCAL);
    }

    return now > expiration;
  } else {
    return true;
  }
};

const storeResponse = (response: Record<string, string | number>) => {
  Storage.setValue(IG.TOKEN, response.auth_token, STORAGE.LOCAL);
  Storage.setValue(IG.EXPIRES, new Date(response.expires), STORAGE.LOCAL);
};

const doInstagramLogin = () => {
  const win = window.open(
    'https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=1116438159688778&redirect_uri=' +
      process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI +
      '&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish',
    '_blank',
    'width=600,height=600'
  );
  return win;
};

const checkToken = async () => {
  return new Promise(async (resolve) => {
    const token = Storage.getValue(IG.TOKEN, STORAGE.LOCAL);
    if (!token) {
      resolve(await instagram.checkAuth());
    } else {
      resolve(false);
    }
  });
};

export default function InstagramLogin() {
  const { on, off } = useEventBus('instagram');
  const initializedRef = useRef(false);

  const runInstagramLogin = useCallback(() => {
    const loginWindow = doInstagramLogin();
    on((data) => {
      if (data) {
        storeResponse(data);
        loginWindow?.close();
      }
      off();
    });
  }, [on, off]);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    async function initialize(skip = false) {
      try {
        const tokenCheck = (await checkToken()) as Record<string, any>;

        const invalidToken = tokenCheck?.data === 'Error';

        if (!skip && tokenCheck && !invalidToken) {
          on((data) => {
            if (data) {
              storeResponse(data);
              initialize(true);
            }
            off();
          });
        } else {
          if (isExpired() || invalidToken) {
            runInstagramLogin();
          }
        }
      } catch (err) {
        runInstagramLogin();
      }
    }

    initialize();
  }, [off, on, runInstagramLogin]);

  return (
    <Script
      async
      defer
      crossOrigin="anonymous"
      src="https://connect.facebook.net/en_US/sdk.js"
    />
  );
}
