import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'sweetq-info',
  templateUrl: './info.component.html',
})
export class SweetQInfoComponent {
  @Input() data: any = false;
  @Input() showVideo: boolean = false;
  @Output() showVideoEvent = new EventEmitter<any>();

  public videoUrl: string = '';

  showModal(value: any, data: any): void {
    if (data.youtubeHref) {
      this.videoUrl =
        data.youtubeHref.replace('watch?v=', 'embed/') + '?rel=0&autoplay=1';
      this.showVideo = value || this.showVideo === false;
      this.showVideoEvent.emit({
        showVideo: this.showVideo,
        videoUrl: this.videoUrl,
      });
    }
  }
}
