import {
  AfterViewInit,
  Component, ElementRef, Input, OnInit, ViewChild
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
  public streamUrl: any = null;
  public isLoaded: boolean = false;
  private progressInterval: any;

  constructor(private http: StreamService) {
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

  get headers(): any {
    return { TID: this.tId }
  }

  async ngOnInit(): Promise<void> {
    this.track.advance = '0:00';
    this.track.isPlaying = false;

    this.streamUrl = await this.http.getStreamUrl({
      id: this.track.id,
      headers: this.headers
    });
    this.audio.src = String(this.streamUrl);
  }

  ngAfterViewInit(): void {
    document.addEventListener("visibilitychange", (event) => {
      if (document.visibilityState !== "visible") {
        if (this.streamUrl) {
          URL.revokeObjectURL(this.streamUrl);
          this.streamUrl = null;
        }
      }
    });

    this.audio.addEventListener(
      "loadeddata",
      () => {
        console.log(this.audio.duration)
        this.track.duration = this.getTimeCodeFromNum(
          String(this.audio.duration).split(".")[0]
        );
        this.audio.volume = .75;
      },
      false
    );
    this.audio.load();
  }

  playTrack() {
    if (this.audio.paused) {
      this.track.isPlaying = true;
      this.audio.play();

      this.progressInterval = setInterval(() => {
        this.progress.style.width = this.audio.currentTime / this.audio.duration * 100 + "%";
        this.track.advance = this.getTimeCodeFromNum(this.audio.currentTime);
      }, 500);

    } else {
      clearInterval(this.progressInterval);
      this.track.isPlaying = false;
      this.audio.pause();
    }
  }

  setTimeline(e: MouseEvent) {
    const timelineWidth = window.getComputedStyle(this.timeline).width;
    const timeToSeek = e.offsetX / parseInt(timelineWidth) * this.audio.duration;
    this.audio.currentTime = timeToSeek;
  }

  getTimeCodeFromNum(num: any) {
    let seconds = Math.round(num);
    let minutes = Math.round(seconds / 60);

    return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
  }
}
