import {    
    Component,
    Input,
    Output,
    EventEmitter
  } from '@angular/core';
import { SpotifyService } from '@services/spotify.service';

  @Component({
    selector: 'spotify',
    templateUrl: './spotify.component.html',  
  })
  
  export class SpotifyComponent {
    // Show or hide modal video
    @Input() show: boolean = false;
    @Output() showChange = new EventEmitter<boolean>(); 

    public embedUrl: string = ''; 
    
    constructor(private spotifyService: SpotifyService) {
      this.embedUrl = this.spotifyService.getEmbedUrl();
    }



    public onShowChanged() {
      this.showChange.emit(this.show);
    }

    hideSpotify()
    {      
      this.showChange.emit(false);
    }
  }