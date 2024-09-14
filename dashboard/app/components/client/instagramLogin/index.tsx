"use client";

import config from "@/app/config";
import Script from "next/script";
import { useEffect } from "react";

declare global {
    interface Window { 
      FB: any; 
      fbAsyncInit: Function 
    }
}

export const initFacebookSdk = () => {
  return new Promise<void>((resolve, reject) => {
    // Load the Facebook SDK asynchronously
    window.fbAsyncInit = () => {
      window.FB.init({
        appId: config.facebookApi.appId,
        cookie: true,
        xfbml: true,
        version: config.facebookApi.version
      });
      // Resolve the promise when the SDK is loaded
      resolve();
    }
  })
};

/**
 * Do Facebook Login 
 * @returns 
 */
const doLogin = () => {
  return new Promise (resolve => {
    window.FB.getLoginStatus(function(response:any) {
      console.log("GET LOGIN STATUS");
      console.log(response);
      if (response.status === 'connected') {
        resolve(response.authResponse);
      } else {
        console.log("LOGIN");
        window.FB.login(function(response:any) {
         resolve(response.authResponse);
        });
      }
    });    
  });
}
export default function InstragramLogin({onReady} : Readonly<{onReady: Function}>) {
  
  useEffect(() => {
    async function initSDK() {
      try {
        await initFacebookSdk();
        const response = await doLogin();
        onReady(response);        
      } catch (err) {

      }
    }
    initSDK();
  });

  return (<Script async defer crossOrigin="anonymous" src="https://connect.facebook.net/en_US/sdk.js" />);
} 