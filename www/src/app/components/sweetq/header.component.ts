import { Component, EventEmitter, Output, OnInit } from '@angular/core';

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
    spotify: 'https://open.spotify.com/album/62V1DcmJGqry4z7m8FS011',
    amazon: 'https://www.amazon.es/dp/B0DNMZJTLX',
    appleMusic:
      'https://music.apple.com/es/album/ya-es-navidad-single/1780778113',
    youtubeMusic:
      'https://music.youtube.com/playlist?list=OLAK5uy_kW9XvM5q-0b3uzxCRc6GP8wenP-VN1NSw',
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
