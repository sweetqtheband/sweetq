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

  public links: any = {
    spotify: 'https://open.spotify.com/album/732Pm0mxnNeGec676x28vW',
    amazon: 'https://www.amazon.es/dp/B0D5CLPNWC',
    appleMusic:
      'https://music.apple.com/es/album/qu%C3%A9-vamos-a-hacer-single/1748711009',
    youtubeMusic:
      'https://music.youtube.com/playlist?list=OLAK5uy_nhB8J7OncZwnuh1TiGl7xDJS8e1lc1l1g',
  };

  ngOnInit() {
    if (!this.release) {
      Object.keys(this.links).forEach((key) => {
        this.links[key] = '#';
        this.target = '_self';
      });
    }
  }

  showSpotifyModal(value?: any): void {
    this.playAlbum = value ? value : this.playAlbum === false;
    this.playAlbumEvent.emit(this.playAlbum);
  }
}