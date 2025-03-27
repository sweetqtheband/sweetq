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
    spotify: 'https://open.spotify.com/album/2Ul8oyq3vUqZC6cIFVIGME',
    amazon: 'https://www.amazon.es/dp/B0DGJPDRTT',
    appleMusic:
      'https://music.apple.com/es/album/golpe-de-suerte-single/1802283427',
    youtubeMusic:
      'https://music.youtube.com/playlist?list=OLAK5uy_mLRXuPUlh7lYzPYMEfS0sY5OF8VwTN_zg',
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
