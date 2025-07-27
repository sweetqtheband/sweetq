import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { SystemService } from '@services/system.service';

@Component({
  selector: 'sweetq-header',
  templateUrl: './header.component.html',
})
export class SweetQHeaderComponent implements OnInit {
  public release = true;
  public target = '_blank';
  public playAlbum = false;

  @Output() playAlbumEvent = new EventEmitter<boolean>();

  get isMobile(): boolean {
    return this.system.isMobile();
  }

  public videoUrl: string = `/assets/video/hero${
    this.isMobile ? '-mobile' : ''
  }.mp4`;

  public links: any = {
    spotify: 'https://open.spotify.com/album/0jYNYEI1QI8LtDYpbCr1Vt',
    amazon: 'https://music.amazon.com/albums/B0FGYC6QXH',
    appleMusic: 'https://music.apple.com/es/album/no-habría-sido-así-single/1825155245',
    youtubeMusic:
      'https://music.youtube.com/playlist?list=OLAK5uy_miCMPTokYkDQG3QhULinUfSCWDKocwVhE',
  };
  constructor(private system: SystemService) {
    this.system = system;
  }
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
