import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  HostListener,
} from '@angular/core';

import { Media } from '@interfaces/media';
import { StreamService } from '@services/stream.service';
import { Nullable } from 'src/app/types';

@Component({
  selector: 'player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
})
export class PlayerComponent implements OnInit, AfterViewInit {
  @ViewChild('audio') _audio!: ElementRef<HTMLAudioElement>;
  @ViewChild('timeline') _timeline!: ElementRef<HTMLDivElement>;
  @ViewChild('progress') _progress!: ElementRef<HTMLDivElement>;

  @Input('tid') tId: Nullable<string> = null;
  @Input() track: Media = { id: '' };
  @Output() onPlay = new EventEmitter<string>();

  public streamUrl: any = null;
  public isLoaded: boolean = false;
  private progressInterval: any;

  constructor(private http: StreamService, private elementRef: ElementRef) {}

  get audio() {
    return this._audio.nativeElement;
  }
  get timeline() {
    return this._timeline.nativeElement;
  }
  get progress() {
    return this._progress.nativeElement;
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

    window.dispatchEvent(event);
  }

  @HostListener('window:onPlaying', ['$event'])
  onPlayingListener({ detail }: any) {
    if (this.track.id !== detail.id && !this.audio.paused) {
      this.playTrack();
    }
  }

  @HostListener('window:playNext', ['$event'])
  playNextListener({ detail }: any) {
    if (this.track.id === detail.id && !this.track.ended) {
      this.playTrack();
    }
  }

  async playTrack() {
    if (!this.streamUrl) {
      await this.getStreamUrl();
    }

    if (this.audio.paused) {
      this.onPlaying();
      this.track.isPlaying = true;
      this.audio.play();

      this.progressInterval = setInterval(() => {
        this.progress.style.width =
          (this.audio.currentTime / this.audio.duration) * 100 + '%';
        this.track.advance = this.getTimeCodeFromNum(this.audio.currentTime);
      }, 500);
    } else {
      this.stopPlay();
    }
  }

  stopPlay() {
    clearInterval(this.progressInterval);
    this.track.isPlaying = false;
    this.audio.pause();
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
