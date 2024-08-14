import { Component, Input, Output, EventEmitter } from '@angular/core';
@Component({
  selector: 'sweetq-videos',
  templateUrl: './videos.component.html',
})
export class SweetQVideosComponent {
  @Input() halfVideos: boolean = false;
  @Input() showVideo: boolean = false;
  @Output() showVideoEvent = new EventEmitter<any>();

  public videoUrl: string = '';
  public videos = [
    { id: 'losiento', url: 'https://www.youtube.com/embed/d6XO7a4ez_U' },
    { id: 'quevamosahacer', url: 'https://www.youtube.com/embed/SI59qpNvZvs' },
    {
      id: 'atrapadoeneltiempo',
      url: 'https://www.youtube.com/embed/glVnYUQwPqE',
    },
    { id: 'caminocorrecto', url: 'https://www.youtube.com/embed/5HU8pUNCpMs' },
    { id: 'cosasclaras', url: 'https://www.youtube.com/embed/1paz9-hyg30' },
  ];

  showModal(value: any, video: string): void {
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
