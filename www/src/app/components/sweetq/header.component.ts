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
    spotify: 'https://open.spotify.com/album/6730lDQr9irWJXAf7lIYhw',
    amazon: 'https://www.amazon.es/dp/B0CRHY3R62',
    appleMusic:
      'https://music.apple.com/us/album/atrapado-en-el-tiempo-single/1724197909',
    youtubeMusic:
      'https://music.youtube.com/playlist?list=OLAK5uy_l4h3DFFhC189MnyMQAZ6eHNciv9LronLE',
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