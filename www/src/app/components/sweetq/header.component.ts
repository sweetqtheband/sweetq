import {    
  Component,  
  EventEmitter,  
  Output,
  OnInit
} from '@angular/core';

@Component({
  selector: 'sweetq-header',
  templateUrl: './header.component.html',  
})

export class SweetQHeaderComponent implements OnInit {       
    public release = true;
    public target = '_blank';     
    public playAlbum = false;
    
    @Output() playAlbumEvent = new EventEmitter<boolean>();

    public links:any = { 
      spotify: "https://open.spotify.com/album/2sLEzbmAKph9t2qIVWyiFh",
      amazon: "https://www.amazon.es/Nueva-Era-Sweet-Q/dp/B075G6WQYW",
      appleMusic: "https://itunes.apple.com/us/album/la-nueva-era-ep/id1280668188",
      googlePlay: "https://play.google.com/store/music/album/Sweet_Q_La_Nueva_Era?id=Bcyjv2sp5jvkk3td7mxdkyogdom"
    };

    ngOnInit() {
      if (!this.release)
      {
        Object.keys(this.links).forEach(key => {
          this.links[key] = "#";
          this.target = "_self";
        });
      }
    }    

    showSpotifyModal(value?:any):void {
      this.playAlbum = value ? value : this.playAlbum === false;
      this.playAlbumEvent.emit(this.playAlbum)
    }
}