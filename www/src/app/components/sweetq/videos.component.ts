import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  HostListener,
  ElementRef,
} from '@angular/core';
import { VideosService } from '@services/videos.service';
import { SystemService } from '@services/system.service';
import { Video } from '@interfaces/video';

@Component({
  selector: 'sweetq-videos',
  templateUrl: './videos.component.html',
  styleUrls: ['./videos.component.scss'],
})
export class SweetQVideosComponent implements OnInit {
  @Input() halfVideos: boolean = false;
  @Input() showVideo: boolean = false;
  @Output() showVideoEvent = new EventEmitter<any>();

  public imagePath: string = '/assets/imgs/youtube/videoclips/';
  public videoUrl: string = '';
  public videos = [] as Video[];
  public hideLeft: boolean = true;
  public hideRight: boolean = false;

  private isDragging = false;
  private startX = 0;
  private scrollLeft = 0;
  private dragged = false;
  private scrollTimeout: any = null;

  constructor(
    private videosSvc: VideosService,
    private el: ElementRef,
    private system: SystemService
  ) {}

  get isMobile() {
    return this.system.isMobile();
  }

  ngOnInit() {
    this.getVideos();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScrollEdges();
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    this.onScrollVideos(event.target as HTMLElement, event);
    this.checkScrollEdges();
  }

  checkScrollEdges() {
    setTimeout(() => {
      const el = this.el.nativeElement.querySelector('.sq-videos-list');
      if (!el) return;

      const scrollLeft = el.scrollLeft;
      const maxScrollLeft = el.scrollWidth - el.clientWidth;
      this.hideRight = scrollLeft >= maxScrollLeft - 1;
      this.hideLeft = this.isMobile ? !this.hideRight : scrollLeft <= 0;
    }, 300);
  }

  onScrollVideos(el: HTMLElement | null, event: WheelEvent) {
    try {
      if (el && !el.classList.contains('sq-videos-list')) {
        this.onScrollVideos(el.parentElement, event);
        return;
      }

      if (el && el.classList.contains('sq-videos-list')) {
        event.preventDefault();
        el.scrollLeft += event.deltaY;
        const maxScrollLeft = el.scrollWidth - el.clientWidth;

        if (el.scrollLeft > 0 && el.scrollLeft < maxScrollLeft) {
          this.hideLeft = false;
          this.hideRight = false;
        }
      }
    } catch {}
  }

  // DRAG START
  onDragStart(event: MouseEvent | TouchEvent) {
    const element = this.el.nativeElement.querySelector('.sq-videos-list');
    if (!element) return;

    this.isDragging = true;
    this.dragged = false;

    this.startX = this.getEventX(event) - element.offsetLeft;
    this.scrollLeft = element.scrollLeft;
  }

  // DRAG MOVE
  onDragMove(event: MouseEvent | TouchEvent) {
    if (!this.isDragging) return;

    const element = this.el.nativeElement.querySelector('.sq-videos-list');
    if (!element) return;

    event.preventDefault();
    const x = this.getEventX(event) - element.offsetLeft;
    const walk = x - this.startX;

    if (Math.abs(walk) > 5) this.dragged = true;
    element.scrollLeft = this.scrollLeft - walk;
    if (this.dragged) {
      this.hideLeft = false;
      this.hideRight = false;
    }
    this.checkScrollEdges();
  }

  // DRAG END
  onDragEnd() {
    this.isDragging = false;
    this.checkScrollEdges();
  }

  private getEventX(event: MouseEvent | TouchEvent): number {
    return event instanceof TouchEvent
      ? event.touches[0].clientX
      : event.clientX;
  }

  async getVideos() {
    this.videos = await this.videosSvc.getVideos();
  }

  showModal(value: any, video: string, event?: MouseEvent): void {
    if (this.dragged) {
      event?.preventDefault();
      event?.stopPropagation();
      return;
    }

    if (video) {
      this.videoUrl = video + '?rel=0&autoplay=1';
      this.showVideo = value || this.showVideo === false;
      this.showVideoEvent.emit({
        showVideo: this.showVideo,
        videoUrl: this.videoUrl,
      });
    }
  }
}
