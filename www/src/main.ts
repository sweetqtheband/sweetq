import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';


declare global {
  interface Window {
    onSpotifyIframeApiReady: any;
    spotifyIframeReady: boolean
  }
}



const spotifyCustomEvent = (IFrameAPI: any) => {
  const event: CustomEvent = new CustomEvent('spotifyApiReady', {
    bubbles: true,
    detail: IFrameAPI
  });

  window.dispatchEvent(event);

  setTimeout(() => {
    if (!window.spotifyIframeReady) {
      spotifyCustomEvent(event);
    }
  }, 1000);
}
window.onSpotifyIframeApiReady = (IFrameAPI: any) => {
  if (!window.spotifyIframeReady) {
    setTimeout(() => {
      spotifyCustomEvent(IFrameAPI);
    }, 1000);
  }
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
