import { OnInit, Component, HostBinding, HostListener } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { StreamService } from '@services/stream.service';
import { Media } from '@interfaces/media';
import { Nullable } from 'src/app/types';
import config from 'src/app/config';
import { Data } from '@interfaces/data';

declare global {
  interface Window {
    onSpotifyIframeApiReady: any;
    spotifyIframeReady: boolean;
  }
}

@Component({
  selector: 'listen-view',
  templateUrl: './listen.component.html',
  styleUrls: [
    '../../../assets/css/fonts.css',
    '../../../assets/css/icons.css',
    './listen.component.scss',
  ],
})
export class ListenComponent implements OnInit {
  @HostBinding('class.sq-view') sqView: boolean = true;
  public items: Media[] = [];
  public tid: Nullable<string> = null;
  public data: Data = { listeners: '-', plays: '-' };  
  private spotifyController: any = null;
  private spotifyPlaying: boolean = false;
  get headers(): any {
    return { TID: this.tid };
  }

  constructor(
    private meta: Meta,
    private http: StreamService,
    private route: ActivatedRoute
  ) {
    this.meta.removeTag('name="keywords"');
    this.meta.removeTag('name="description"');
    this.meta.updateTag({ name: 'robots', content: 'noindex' });
  }

  @HostListener('window:onPlaying', ['$event'])
  trackPlaying({ detail }: any) {
    if (+detail.id > 0 && this.spotifyPlaying) {
      this.spotifyController.pause();
    }
  }

  onSpotifyIframeApiReady(IFrameAPI: any) {
    const element = document.getElementById('embed-iframe');
    const options = {
      uri: `spotify:track:${config.listen.trackId}`,
      theme: 'dark',
      height: '80',
    };
    const callback = (EmbedController: any) => {
      window.spotifyIframeReady = true;
      this.spotifyController = EmbedController;
      EmbedController.addListener('playback_update', (e: any) => {
        this.spotifyPlaying = !e.data.isPaused;
        if (this.spotifyPlaying) {
          const event: CustomEvent = new CustomEvent('onPlaying', {
            bubbles: true,
            detail: { id: 0 },
          });

          window.dispatchEvent(event);
        }
      });
    };
    IFrameAPI.createController(element, options, callback);
  }

  loadScript() {
    let node = document.createElement('script');
    node.src = 'https://open.spotify.com/embed/iframe-api/v1';
    node.type = 'text/javascript';
    node.async = true;
    document.getElementsByTagName('head')[0].appendChild(node);
  }

  async ngOnInit(): Promise<any> {
    (<any>window).onSpotifyIframeApiReady =
      this.onSpotifyIframeApiReady.bind(this);
    this.loadScript();

    this.tid = this.route.snapshot.queryParams['tId'];
    this.data = await this.http.getData({
      params: {
        artistId: config.listen.artistId,
        trackId: config.listen.trackId,
      },
      headers: this.headers,
    });

    this.items = await this.http.getMedia({ headers: this.headers });
  }
}
