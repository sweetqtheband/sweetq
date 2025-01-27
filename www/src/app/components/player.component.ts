import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  DoCheck,
  Output,
  EventEmitter,
  ViewChild,
  HostBinding,
  HostListener,
  OnDestroy,
} from '@angular/core';
import { Album } from '@interfaces/album';

import { Media } from '@interfaces/media';
import { StreamService } from '@services/stream.service';
import { Nullable } from 'src/app/types';

@Component({
  selector: 'player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
})
export class PlayerComponent
  implements OnInit, OnDestroy, AfterViewInit, DoCheck
{
  @ViewChild('audio') _audio!: ElementRef<HTMLAudioElement>;
  @ViewChild('timeline') _timeline!: ElementRef<HTMLDivElement>;
  @ViewChild('progress') _progress!: ElementRef<HTMLDivElement>;
  @ViewChild('video') _video!: ElementRef<HTMLVideoElement>;

  @Input('type') type: Nullable<string> = null;
  @Input('tid') tId: Nullable<string> = null;
  @Input('index') index?: number;

  @HostBinding('class') get classes(): string {
    const obj = {
      [this.type as string]: Boolean(this.type),
      current: this.track.isCurrent,
    };
    return Object.keys(obj)
      .filter((key) => !!obj[key])
      .join(' ');
  }
  @Input() track: Media = { id: '', isCurrent: false };
  @Input('album') album?: Nullable<Album> = null;
  @Output() onPlay = new EventEmitter<string>();
  @Output() ready = new EventEmitter<any>();

  public streamUrl: any = null;
  public isLoaded: boolean = false;
  public isDragging: boolean = false;
  public videoLoaded: boolean = false;
  private progressInterval: any;
  private listeners: any = {};
  public progressWidth: number = 0;

  constructor(private http: StreamService, private elementRef: ElementRef) {}

  @HostListener('window:onPlaying', ['$event'])
  onPlayingListener({ detail }: any) {
    if (this.track.id !== detail.id) {
      if (!this.audio.paused) this.stopPlay();
      this.track.isCurrent = false;
      this.audio.currentTime = 0;
      this.progressWidth = 0;
    }
  }

  @HostListener('window:playNext', ['$event'])
  async playNextListener({ detail }: any) {
    if (this.track.id === detail.id) {
      await this.playTrack();
      this.track.isCurrent = true;
    } else {
      this.stopPlay();
      this.audio.currentTime = 0;
      this.progressWidth = 0;
      this.track.isCurrent = false;
    }
  }

  @HostListener('window:startPlay')
  async startPlayListener() {
    if (this.track.isCurrent) {
      this.playTrack();
    }
  }

  @HostListener('window:stopPlay')
  async stopPlayListener() {
    if (this.track.isPlaying) {
      this.stopPlay();
    }
  }

  get video() {
    return this._video?.nativeElement || null;
  }
  get audio() {
    return this._audio.nativeElement;
  }
  get timeline() {
    return this._timeline.nativeElement;
  }
  get progress() {
    return this._progress.nativeElement;
  }

  get trackVideo() {
    return `/assets/video/${this.track.video}`;
  }
  get headers(): any {
    return { TID: this.tId };
  }

  videoStyle(): Object {
    const isHorizontal = window.innerHeight < window.innerWidth;
    const prop9_16 = window.innerWidth / 0.5625;

    return {
      width:
        isHorizontal || (!isHorizontal && prop9_16 > window.innerHeight)
          ? '100%'
          : null,
      height: !isHorizontal && prop9_16 < window.innerHeight ? '100%' : null,
    };
  }

  async ngOnInit(): Promise<void> {
    this.getStreamMetadata();
    this.listeners.videoLoadedData = () => {
      this.videoLoaded = true;
      this.emitVideoLoaded();
    };

    this.listeners.documentVisibilityChange = () => {
      if (document.visibilityState !== 'visible') {
        if (this.streamUrl) {
          URL.revokeObjectURL(this.streamUrl);
          this.streamUrl = null;
        }
      }
    };

    this.listeners.audioLoadedData = () => {
      this.audio.volume = 1;
    };

    this.listeners.audioEnded = () => {
      this.audio.currentTime = 0;
      this.progressWidth = 0;
      this.track.ended = true;
      this.stopPlay();

      const event: CustomEvent = new CustomEvent('playNext', {
        bubbles: true,
        detail: { id: this.track.nextId },
      });
      window.dispatchEvent(event);
    };

    this.listeners.audioTimeUpdate = () => {
      if (!this.isDragging) {
        this.progressWidth =
          (this.audio.currentTime / this.audio.duration) * 100;
      }
    };

    if (!this.streamUrl) {
      await this.getStreamUrl();
    }
  }

  async ngOnDestroy(): Promise<void> {
    this.video.removeEventListener(
      'loadeddata',
      this.listeners.videoLoadedData,
      false
    );

    document.removeEventListener(
      'visibilitychange',
      this.listeners.documentVisibilityChange,
      false
    );

    this.audio.removeEventListener(
      'loadeddata',
      this.listeners.audioLoadedData
    );

    this.audio.removeEventListener('ended', this.listeners.audioEnded, false);

    this.audio.removeEventListener(
      'timeupdate',
      this.listeners.audioTimeUpdate,
      false
    );
  }

  async getStreamMetadata() {
    this.track.advance = '0:00';
    this.track.isPlaying = false;

    const metadata = await this.http.getStreamMetadata({
      id: this.track.id,
      headers: this.headers,
    });

    this.track.duration = this.getTimeCodeFromNum(metadata.data.duration);
    this.ready.emit({ id: this.track.id, duration: metadata.data.duration });
  }

  async getStreamUrl() {
    this.track.advance = '0:00';
    this.track.isPlaying = false;

    this.streamUrl = await this.http.getStreamUrl({
      id: this.track.id,
      headers: { ...this.headers },
    });
    this.audio.src = String(this.streamUrl);
  }

  ngDoCheck(): void {
    if (this.video) {
      if (!this.videoLoaded) {
        this.video.addEventListener(
          'loadeddata',
          this.listeners.videoLoadedData,
          false
        );
      }
    }
  }

  emitVideoLoaded() {
    const event: CustomEvent = new CustomEvent('videoLoaded', {
      bubbles: true,
      detail: { id: this.track.id },
    });
    window.dispatchEvent(event);
  }

  ngAfterViewInit(): void {
    document.addEventListener(
      'visibilitychange',
      this.listeners.documentVisibilityChange,
      false
    );

    this.audio.addEventListener(
      'loadeddata',
      this.listeners.audioLoadedData,
      false
    );
    this.audio.load();

    this.audio.addEventListener(
      'timeupdate',
      this.listeners.audioTimeUpdate,
      false
    );

    this.audio.addEventListener('ended', this.listeners.audioEnded, false);
  }

  onPlaying() {
    const event: CustomEvent = new CustomEvent('onPlaying', {
      bubbles: true,
      detail: { id: this.track.id },
    });

    this.track.isCurrent = true;
    window.dispatchEvent(event);
  }

  setMetadata() {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: this.track.title,
        album: this.album?.title || 'Sweet Q',
        artist: 'Sweet Q',
        artwork: [
          {
            src: `${window.location.origin}/assets/imgs/cover/${
              this.type === 'album' ? this.album?.cover : this.track.cover
            }`,
          },
        ],
      });
    }
  }

  async playTrack() {
    try {
      if (!this.streamUrl) {
        await this.getStreamUrl();
      }

      if (this.audio && this.audio.paused) {
        this.onPlaying();
        this.track.isPlaying = true;
        await this.audio.play();
        this.setMetadata();
        if (this.video) {
          this.video.play();
        }
        if (this.videoLoaded) {
          this.emitVideoLoaded();
        }

        this.progressInterval = setInterval(() => {
          this.progressWidth =
            (this.audio.currentTime / this.audio.duration) * 100;
          this.track.advance = this.getTimeCodeFromNum(this.audio.currentTime);
        }, 500);
      } else {
        this.stopPlay();
      }
    } catch (e) {
      console.log(this.track.id);
    }
  }

  onDragStart(event: MouseEvent | TouchEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.isDragging && this.track.isCurrent) {
      this.stopPlay();
      this.isDragging = true;
    }
  }

  onDragging(event: MouseEvent | TouchEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.isDragging && this.track.isCurrent) {
      this.updateProgress(event);
    }
  }

  onDragEnd(event: MouseEvent | TouchEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.isDragging && this.track.isCurrent) {
      this.isDragging = false;
      this.setTimeline(event);
      this.playTrack();
    }
  }

  updateProgress(event: MouseEvent | TouchEvent): void {
    const bar = event.target as HTMLElement;
    const rect = bar.getBoundingClientRect();
    const offsetX =
      event instanceof MouseEvent
        ? event.clientX
        : event.touches[0].clientX - rect.left;
    const width = rect.width;
    this.progressWidth = Math.min(Math.max((offsetX / width) * 100, 0), 100);
  }

  stopPlay() {
    clearInterval(this.progressInterval);
    this.track.isPlaying = false;
    if (this.audio) {
      this.audio.pause();
    }
    if (this.video) {
      this.video.pause();
    }
  }

  setTimeline(e: MouseEvent | TouchEvent) {
    const timelineWidth = window.getComputedStyle(this.timeline).width;
    const rect = (e.target as HTMLElement).getBoundingClientRect();

    const timeToSeek =
      ((e instanceof MouseEvent
        ? e.offsetX
        : e.changedTouches[0].clientX - rect.left) /
        parseInt(timelineWidth)) *
      this.audio.duration;
    this.audio.currentTime = timeToSeek;
  }

  getTimeCodeFromNum(num: any) {
    let minutes = Math.floor(num / 60);
    let seconds = Math.floor(num - minutes * 60);

    return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
  }
}
