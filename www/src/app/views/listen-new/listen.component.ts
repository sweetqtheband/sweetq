import { OnInit, AfterViewInit, DoCheck, Component, ElementRef, HostBinding, Output, EventEmitter, HostListener, ViewChild } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { StreamService } from '@services/stream.service';
import { Media } from '@interfaces/media';
import { Nullable } from 'src/app/types';
import config from 'src/app/config';
import { Data } from '@interfaces/data';
import { Albums } from '@interfaces/albums';

@Component({
  selector: 'listen-view',
  templateUrl: './listen.component.html',
  styleUrls: [
    '../../../assets/css/fonts.css',
    '../../../assets/css/icons.css',
    './listen.component.scss',
  ],
})
export class ListenComponent implements OnInit, AfterViewInit, DoCheck {
  @ViewChild('video') _video!: ElementRef<HTMLVideoElement>;
  @Output()
  public onInteraction = new EventEmitter<boolean>();
  @HostListener('onInteraction', ['$event'])
  public onInteractionHandler(e: Event) {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.initialId = this.defaultItem.id;
    }, 100);
  }
  @HostListener('window:videoLoaded', ['$event'])
  onVideoLoaded() {
    if (this.video) {
      this.video.pause();
    }
    this.isInit = true;
  }
  @HostBinding('class.sq-view') sqView: boolean = true;

  public items: Media[] = [];
  public albums: Albums = {
    released: [],
    upcoming: []
  }
  
  public tid: Nullable<string> = null;
  public data: Data = { listeners: '-', plays: '-' };
  public defaultItem: Media = { id: '' };
  public timeout: any;
  public isInit: boolean = false;
  public handleInteraction: any = () => this.onInteraction.emit(true);
  public interactionEvents: string[] = ['click', 'touchstart'];
  public videoLoaded: boolean = false;
  public initialId: string = '';

  get headers(): any {
    return { TID: this.tid };
  }

  get loadVideo() {
    return `/assets/video/losiento.mp4`;
  }

  constructor(
    private el: ElementRef,
    private meta: Meta,
    private http: StreamService,
    private route: ActivatedRoute
  ) {
    this.meta.removeTag('name="keywords"');
    this.meta.removeTag('name="description"');
    this.meta.updateTag({ name: 'robots', content: 'noindex' });
  }

  get video() {
    return this._video?.nativeElement || null;
  }

  addInteractionSubscriptions() {
    this.interactionEvents.forEach((eventName: string) =>
      this.el.nativeElement
        .querySelector('.video-wrapper')
        .addEventListener(
          eventName as keyof WindowEventMap,
          this.handleInteraction,
          true
        )
    );
  }

  removeInteractionSubscriptions() {
    this.interactionEvents.forEach((eventName: string) =>
      this.el.nativeElement
        .querySelector('.video-wrapper')
        .removeEventListener(
          eventName as keyof WindowEventMap,
          this.handleInteraction,
          true
        )
    );
  }

  async ngOnInit(): Promise<any> {
    this.tid = this.route.snapshot.queryParams['tId'];
    this.data = await this.http.getData({
      params: {
        artistId: config.listen.artistId,
        trackId: config.listen.trackId,
      },
      headers: this.headers,
    });

    this.items = await this.http.getMedia({ headers: this.headers });
    
    this.albums.released = this.items.filter(item => ['latest', 'released'].includes(item.status as string));
    this.albums.upcoming = this.items.filter((item) => item.status === 'upcoming');


    const item = this.items.find((item) => item.status === 'latest');

    if (item) {
      this.defaultItem = item;
    }
  }

  ngAfterViewInit() {
    this.addInteractionSubscriptions();
  }

  onPlay() {
    this.removeInteractionSubscriptions();
  }

  ngDoCheck(): void {
    if (this.video && !this.videoLoaded) {
      setTimeout(() => {
        this.videoLoaded = true;
      }, 300);
    }
  }
}
