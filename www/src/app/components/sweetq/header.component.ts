import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { SpotifyService } from '@services/spotify.service';
import { SystemService } from '@services/system.service';

@Component({
  selector: 'sweetq-header',
  templateUrl: './header.component.html',
})
export class SweetQHeaderComponent implements OnInit {
  public release = true;
  public target = '_blank';
  public playAlbum = false;
  public embedUrl: string = '';

  @Output() playAlbumEvent = new EventEmitter<boolean>();

  get isMobile(): boolean {
    return this.system.isMobile();
  }

  public videoUrl: string = `/assets/video/hero${
    this.isMobile ? '-mobile' : ''
  }.mp4`;

  public links: any = {
    spotify: 'https://open.spotify.com/intl-es/artist/74Vs2gSCwnlCiV4yjaFIMb',
    amazon: 'https://www.amazon.com/music/player/artists/B01CT0X85M/sweet-q',
    appleMusic: 'https://music.apple.com/es/artist/sweet-q/1092144349',
    youtubeMusic:
      'https://music.youtube.com/channel/UC_O66d_uvnaMYUh-kDwY-EA',
  };
  constructor(private system: SystemService, spotify: SpotifyService) {
    this.system = system;
    this.embedUrl = spotify.getEmbedUrl();
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
