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
  HostListener
} from '@angular/core';

import { Media } from '@interfaces/media';
import { StreamService } from '@services/stream.service';
import { Nullable } from 'src/app/types';

@Component({
  selector: 'player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
})
export class PlayerComponent implements OnInit, AfterViewInit, DoCheck {
  @ViewChild('audio') _audio!: ElementRef<HTMLAudioElement>;
  @ViewChild('timeline') _timeline!: ElementRef<HTMLDivElement>;
  @ViewChild('progress') _progress!: ElementRef<HTMLDivElement>;
  @ViewChild('video') _video!: ElementRef<HTMLVideoElement>;

  @Input('type') type: Nullable<string> = null;
  @HostBinding('class') get classes(): string {
    const obj = {
      [this.type as string]: Boolean(this.type),
      current: this.track.isCurrent,
    };
    return Object.keys(obj)
      .filter((key) => !!obj[key])
      .join(' ');
  }
  @Input('tid') tId: Nullable<string> = null;
  @Input() track: Media = { id: '', isCurrent: false };
  @Output() onPlay = new EventEmitter<string>();

  public streamUrl: any = null;
  public isLoaded: boolean = false;
  public videoLoaded: boolean = false;
  private progressInterval: any;

  constructor(private http: StreamService, private elementRef: ElementRef) {}
  
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
    return `/assets/video/${this.track.id}.mp4`;
  }
  get headers(): any {
    return { TID: this.tId };
  }

  async ngOnInit(): Promise<void> {
    this.getStreamUrl();
  }

  async getStreamUrl() {
    this.track.advance = '0:00';
    this.track.isPlaying = false;

    this.streamUrl = await this.http.getStreamUrl({
      id: this.track.id,
      headers: this.headers,
    });
    this.audio.src = String(this.streamUrl);
  }

  ngDoCheck(): void {
    if (this.video && !this.videoLoaded) {
      this.videoLoaded = true;
      this.video.addEventListener(
        'loadeddata',
        () => {
          const event: CustomEvent = new CustomEvent('videoLoaded', {
            bubbles: true,
            detail: { id: this.track.id },
          });
          window.dispatchEvent(event);
        },
        false
      );
    }
  }

  ngAfterViewInit(): void {
    document.addEventListener('visibilitychange', (event) => {
      if (document.visibilityState !== 'visible') {
        if (this.streamUrl) {
          URL.revokeObjectURL(this.streamUrl);
          this.streamUrl = null;
        }
      }
    });    

    this.audio.addEventListener(
      'loadeddata',
      () => {
        this.track.duration = this.getTimeCodeFromNum(
          String(this.audio.duration)
        );
        this.audio.volume = 0.75;
      },
      false
    );
    this.audio.load();

    this.audio.addEventListener('ended', () => {
      this.audio.currentTime = 0;
      this.progress.style.width = '0%';
      this.track.ended = true;
      this.stopPlay();

      const event: CustomEvent = new CustomEvent('playNext', {
        bubbles: true,
        detail: { id: this.track.nextId },
      });
      window.dispatchEvent(event);
    });
  }

  onPlaying() {
    const event: CustomEvent = new CustomEvent('onPlaying', {
      bubbles: true,
      detail: { id: this.track.id },
    });

    this.track.isCurrent = true;
    window.dispatchEvent(event);
  }

  @HostListener('window:onPlaying', ['$event'])
  onPlayingListener({ detail }: any) {
    if (this.track.id !== detail.id) {
      if (!this.audio.paused) this.stopPlay();
      this.track.isCurrent = false;
    }
  }

  @HostListener('window:playNext', ['$event'])
  async playNextListener({ detail }: any) {
    if (this.track.id === detail.id) {
      await this.playTrack();
      this.track.isCurrent = true;
    } else {
      this.stopPlay();
      this.track.isCurrent = false;
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
        if (this.video) {
          this.video.play();
        }

        this.progressInterval = setInterval(() => {
          this.progress.style.width =
            (this.audio.currentTime / this.audio.duration) * 100 + '%';
          this.track.advance = this.getTimeCodeFromNum(this.audio.currentTime);
        }, 500);
      } else {
        this.stopPlay();
      }
    } catch(e) {
      console.log(this.track.id);
    }
  }

  stopPlay() {
    clearInterval(this.progressInterval);
    this.track.isPlaying = false;
    if (this.audio)
    {
      this.audio.pause();
    }
    if (this.video)
    {
      this.video.pause();
    }
  }

  setTimeline(e: MouseEvent) {
    const timelineWidth = window.getComputedStyle(this.timeline).width;
    const timeToSeek =
      (e.offsetX / parseInt(timelineWidth)) * this.audio.duration;
    this.audio.currentTime = timeToSeek;
  }

  getTimeCodeFromNum(num: any) {
    let minutes = Math.floor(num / 60);
    let seconds = Math.floor(num - minutes * 60);

    return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
  }
}
