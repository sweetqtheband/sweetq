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
      amazon: "https://www.amazon.es/dp/B0C2CVQDYN/ref=sr_1_1?__mk_es_ES=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=I2N0HQPU4U7R&keywords=el+camino+correcto&qid=1683268220&s=dmusic&sprefix=el+camino+correcto+%2Cdigital-music%2C82&sr=1-1",
      appleMusic: "https://music.apple.com/us/album/el-camino-correcto-single/1681612169",
      youtubeMusic: "https://music.youtube.com/playlist?list=OLAK5uy_nyRpPwsfhWIu5s23cXyI84gOU6zuvpi-U"
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