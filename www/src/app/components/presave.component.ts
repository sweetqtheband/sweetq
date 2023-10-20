import {    
  Component
} from '@angular/core';

import { SpotifyService } from '@services/spotify.service';
import config from '../config';


@Component({
  selector: 'presave',
  templateUrl: './presave.component.html',  
})


export class PresaveComponent {

  private presavePlatforms: Array<string> = ['spotify', 'appleMusic'];
  public platforms: any = [];
  private config : any = config;
  private services: any = {};

  constructor(private spotifySvc: SpotifyService) {        
    this.services.spotify = this.spotifySvc;

    this.initialize();
  }

  async initialize() {
    this.presavePlatforms.forEach((platform: string) => {
      (async() => {
        if (this.config[platform]?.nextRelease) {
          this.platforms.push({
            id: platform,
            icon: 'icon-' + platform,
            class: 'sq-' + platform,
            text: 'presave.' + platform,
            presaveUrl: await this.services[platform].authorize()
          });        
        }
      })()
    });
  }

  async doPresave(platform : any) {      
    const service:any = this.services[platform.id];    
    service.preSave();            
  }

  setTabListener(platform:any) {
    const service:any = this.services[platform.id];    
    localStorage.setItem('tabOpened', '1');      
    const interval = setInterval(() => {
      if (localStorage.getItem('tabOpened') === '0') {
        clearInterval(interval);
        service.preSave();
      }
    }, 300)
    return true;
  }
}