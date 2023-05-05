import {    
  Component, OnInit
} from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { SpotifyService } from '@services/spotify.service';

@Component({
  selector: 'callback-view',
  templateUrl: './callback.component.html',  
})

export class CallbackComponent implements OnInit {
  constructor(private spotifySvc: SpotifyService, private activatedRoute: ActivatedRoute) {          
  }

  ngOnInit() {    

    this.activatedRoute.queryParams.subscribe(async params => {
      // Spotify code received, close window
      if (params['code']) {
        await this.spotifySvc.setCode(params['code']);           
        localStorage.setItem('tabOpened', '0');        
        self.close();                           
      }
    });
  }  
};