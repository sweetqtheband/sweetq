import { OnInit, Component, HostBinding } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { StreamService } from '@services/stream.service';
import { Media } from '@interfaces/media';
import { Nullable } from 'src/app/types';
import { Data } from '@interfaces/data';
import { SystemService } from '@services/system.service';
import { DateService } from '@services/date.service';
import { EncryptionService } from '@services/encryption.service';

@Component({
  selector: 'track-view',
  templateUrl: './track.component.html',
  styleUrls: [
    '../../../assets/css/fonts.css',
    '../../../assets/css/icons.css',
    './track.component.scss',
  ],
})
export class TrackComponent implements OnInit {
  @HostBinding('class.sq-view') sqView: boolean = true;

  public showLoader: boolean = true;
  public item: Media = { id: '' };
  public links: Record<string, any>[] = [];

  public tid: Nullable<string> = null;
  public data: Data = { listeners: '-', plays: '-' };
  public defaultItem: Media = { id: '' };
  public timeout: any;
  public isInit: boolean = false;
  public initialId: string = '';
  public isPlaying: boolean = false;

  public trackId: Nullable<string> = null;
  
  public longWrapper: boolean = false;

  constructor(
    private router: Router,
    private meta: Meta,
    private http: StreamService,
    private system: SystemService,
    private route: ActivatedRoute,
    private dateSvc: DateService,
    private enc: EncryptionService
  ) {
    this.meta.removeTag('name="keywords"');
    this.meta.removeTag('name="description"');
    this.meta.updateTag({ name: 'robots', content: 'noindex' });
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
      this.trackId = this.enc.decrypt(
        'track',
        decodeURI(this.route.snapshot.queryParams?.['track'])
      );

      this.item = await this.http.getTrack({
        headers: this.headers,
        trackId: this.trackId,
      });
      if (this.item.spotify) {
        this.links.push({
          type: 'spotify',
          icon: 'icon-spotify',
          text: 'links.spotifyAvailable',
          trParams: {
            date: this.dateSvc.format('short.text', this.item.date),
          },
          button: 'primary',
          link: this.item.spotify.url,
        });
      }

      if (this.item.apple) {
        this.links.push({
          type: 'appleMusic',
          icon: 'icon-apple-music',
          text: 'links.appleAvailable',
          trParams: {
            date: this.dateSvc.format('short.text', this.item.date),
          },
          button: 'primary',
          link: this.item.apple.url,
        });
      }
    } catch (err) {
      this.router.navigate(['/']);
    }
  }

  handleOpen(isOpen: string[]) {
    this.longWrapper = isOpen.includes('lyrics') || isOpen.includes('aboutUs');
  }
}
