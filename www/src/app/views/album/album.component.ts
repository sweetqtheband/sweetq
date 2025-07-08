import { OnInit, Component, HostBinding } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { StreamService } from '@services/stream.service';
import { Nullable } from 'src/app/types';
import { Data } from '@interfaces/data';
import { SystemService } from '@services/system.service';
import { EncryptionService } from '@services/encryption.service';
import { Album } from '@interfaces/album';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'album-view',
  templateUrl: './album.component.html',
  styleUrls: [
    '../../../assets/css/fonts.css',
    '../../../assets/css/icons.css',
    './album.component.scss',
  ],
})
export class AlbumComponent implements OnInit {
  @HostBinding('class.sq-view') sqView: boolean = true;

  public showLoader: boolean = true;
  public album: Album = { id: '' };
  public links: Record<string, any>[] = [];

  public tid: Nullable<string> = null;
  public data: Data = { listeners: '-', plays: '-' };
  public timeout: any;
  public isReady: boolean = false;
  public isInit: boolean = false;
  public initialId: string = '';
  public isPlaying: boolean = false;

  public albumId: Nullable<string> = null;

  public longWrapper: boolean = false;

  private _duration: number = 0;

  private tracksReady: Record<string, boolean> = {};

  constructor(
    private router: Router,
    private meta: Meta,
    private http: StreamService,
    private system: SystemService,
    private route: ActivatedRoute,
    private enc: EncryptionService,
    private translate: TranslateService
  ) {
    this.meta.removeTag('name="keywords"');
    this.meta.removeTag('name="description"');
    this.meta.updateTag({ name: 'robots', content: 'noindex' });
  }
  get duration() {
    return this.getTimeCodeFromNum(this._duration);
  }
  get headers(): any {
    return { TID: this.tid };
  }

  get isMobile() {
    return this.system.isMobile();
  }

  get maxHeight() {
    return window.innerHeight + 'px';
  }

  async ngOnInit(): Promise<any> {
    this.tid = this.route.snapshot.queryParams?.['tId'];

    try {
      this.albumId = this.enc.decrypt(
        'album',
        this.route.snapshot.queryParams?.['album']
      );

      this.album = await this.http.getAlbum({
        headers: this.headers,
        albumId: this.albumId,
      });

      this.setMediaSessionHandlers();
    } catch (err) {
      this.router.navigate(['/']);
    }
  }

  handleOpen(isOpen: string[]) {
    this.longWrapper = isOpen.includes('lyrics') || isOpen.includes('aboutUs');
  }

  getTimeCodeFromNum(num: any) {
    let minutes = Math.floor(num / 60);
    let seconds = Math.floor(num - minutes * 60);

    return `${minutes}${this.translate.instant('time.short.min')} ${String(
      seconds % 60
    ).padStart(2, '0')}${this.translate.instant('time.short.sec')}`;
  }

  handleReady(data: any) {
    this._duration += data.duration;
    this.tracksReady[data.id] = true;

    if (Object.keys(this.tracksReady).length === this.album.tracks?.length) {
      this.showLoader = false;
      this.isReady = true;
    }
  }

  handlers: any = {
    play: () => {
      const event: CustomEvent = new CustomEvent('startPlay', {
        bubbles: true,
      });
      window.dispatchEvent(event);
    },
    pause: () => {
      const event: CustomEvent = new CustomEvent('stopPlay', {
        bubbles: true,
      });
      window.dispatchEvent(event);
    },
    stop: () => {
      const event: CustomEvent = new CustomEvent('stopPlay', {
        bubbles: true,
      });
      window.dispatchEvent(event);
    },
    previousTrack: () => {
      if (navigator.mediaSession.metadata?.title) {
        const track = this.album.tracks?.find(
          (track) => track.title === navigator.mediaSession.metadata?.title
        );
        if (track?.previousId) {
          const event: CustomEvent = new CustomEvent('playNext', {
            bubbles: true,
            detail: { id: track.previousId },
          });
          window.dispatchEvent(event);
        }
      }
    },
    nextTrack: () => {
      if (navigator.mediaSession.metadata?.title) {
        const track = this.album.tracks?.find(
          (track) => track.title === navigator.mediaSession.metadata?.title
        );
        if (track?.nextId) {
          const event: CustomEvent = new CustomEvent('playNext', {
            bubbles: true,
            detail: { id: track.nextId },
          });
          window.dispatchEvent(event);
        }
      }
    },
  };

  setMediaSessionHandlers() {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', this.handlers.play);
      navigator.mediaSession.setActionHandler('pause', this.handlers.pause);
      navigator.mediaSession.setActionHandler('stop', this.handlers.stop);
      navigator.mediaSession.setActionHandler(
        'previoustrack',
        this.handlers.previousTrack
      );
      navigator.mediaSession.setActionHandler(
        'nexttrack',
        this.handlers.nextTrack
      );
    }
  }
}
