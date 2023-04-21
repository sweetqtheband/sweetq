import {    
    Component,
    Input,
    Output,
    EventEmitter
  } from '@angular/core';

  @Component({
    selector: 'spotify',
    templateUrl: './spotify.component.html',  
  })
  
  export class SpotifyComponent {
    
  
    // Show or hide modal video
    @Input() show: boolean = false;
    @Output() showChange = new EventEmitter<boolean>(); 
    

    public onShowChanged() {
      this.showChange.emit(this.show);
    }

    hideSpotify()
    {      
      this.showChange.emit(false);
    }
  }