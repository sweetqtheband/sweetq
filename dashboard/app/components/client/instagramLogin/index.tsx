'use client';

import { IG, STORAGE } from '@/app/constants';
import { useEventBus } from '@/app/hooks/event';
import { Storage } from '@/app/services/storage';
import Script from 'next/script';
import { useEffect } from 'react';

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: Function;
  }
}

export const initFacebookSdk = () => {
  return new Promise<void>((resolve, reject) => {
    // Load the Facebook SDK asynchronously
    window.fbAsyncInit = () => {
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_META_APP_ID,
        cookie: true,
        xfbml: true,
        version: process.env.NEXT_PUBLIC_META_VERSION,
      });
      // Resolve the promise when the SDK is loaded
      resolve();
    };
  });
};

const isExpired = () => {
  const expires = Storage.getValue(IG.EXPIRES, STORAGE.LOCAL);
  if (expires) {
    const now = new Date().getTime();
    const expiration = new Date(Number(expires)).getTime() * 1000;
    if (now > expiration) {
      Storage.removeValue(IG.TOKEN, STORAGE.LOCAL);
      Storage.removeValue(IG.USER, STORAGE.LOCAL);
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
    'https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=1116438159688778&redirect_uri=https://overly-awaited-leech.ngrok-free.app/api/instagram/oauth&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish',
    '_blank',
    'width=600,height=600'
  );
  return win;
};

export default function InstagramLogin() {
  const { on, off } = useEventBus('instagram');

  useEffect(() => {
    async function initSDK() {
      try {
        await initFacebookSdk();
        if (isExpired()) {
          const loginWindow = doInstagramLogin();
          on((data) => {
            if (data) {
              storeResponse(data);
              loginWindow?.close();
            }
            off();
          });
        }
      } catch (err) {}
    }
    initSDK();
  });

  return (
    <Script
      async
      defer
      crossOrigin="anonymous"
      src="https://connect.facebook.net/en_US/sdk.js"
    />
  );
}
