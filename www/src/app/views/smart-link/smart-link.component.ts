import {
  Component,
  OnDestroy,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewChecked,
} from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { StreamService } from '@services/stream.service';
import { ActivatedRoute } from '@angular/router';
import { Nullable } from 'src/app/types';
import { Media } from '@interfaces/media';

@Component({
  selector: 'smart-link-view',
  templateUrl: './smart-link.component.html',
  styleUrls: [
    '../../../assets/css/fonts.css',
    '../../../assets/css/icons.css',
    './smart-link.component.scss',
  ],
  host: { class: 'black' },
})
export class SmartLinkComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('scroll') _scroll!: ElementRef<HTMLDivElement>;

  windowResizeHandler;

  public fitScroll: boolean = false;
  public links: any[] = [];
  public title: string = '';
  public track: Nullable<string> = null;
  public item: Nullable<Media> = null;
  private initialized: boolean = false;

  constructor(
    private streamSvc: StreamService,
    private meta: Meta,
    private route: ActivatedRoute
  ) {
    this.meta.removeTag('name="keywords"');
    this.meta.removeTag('name="description"');
    this.meta.updateTag({ name: 'robots', content: 'noindex' });
    this.windowResizeHandler = () => {
      this.fitScroll = false;
      requestAnimationFrame(() => {
        this.setViewport();
      });
    };
  }

  async ngOnInit() {
    this.track = this.route.snapshot.params['track'];

    this.setData();
    window.addEventListener('resize', this.windowResizeHandler);
  }

  ngAfterViewChecked() {
    if (!this.initialized && this._scroll?.nativeElement?.clientHeight) {
      this.initialized = true; // Evita llamadas múltiples
      this.setViewport();
    }
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.windowResizeHandler);
  }

  setViewport() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    this.fitScroll = false;
    if (this._scroll?.nativeElement) {
      this.fitScroll =
        this._scroll.nativeElement.clientHeight > document.body.clientHeight;
    }
  }

  async setData() {
    this.item = await this.streamSvc.getTrack({
      trackId: this.track?.replaceAll('-', ''),
      params: { public: true },
    });
    this.links = Object.keys(this.item.links ?? {}).reduce(
      (acc: any[], platform: string) => {
        const item = this.item ? this.item[platform as keyof Media] : null;
        acc.push({
          type: platform,
          icon: `logo-${platform}`,
          link: item?.url,
        });
        return acc;
      },
      []
    );
  }
}
