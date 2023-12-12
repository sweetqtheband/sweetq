import { Component, Input, Output, EventEmitter } from '@angular/core';
import { KeyPair } from '@interfaces/keyPair';
@Component({
  selector: 'sweetq-videos',
  templateUrl: './videos.component.html',
})
export class SweetQVideosComponent {
  @Input() halfVideos: boolean = false;
  @Input() showVideo: boolean = false;
  @Output() showVideoEvent = new EventEmitter<any>();

  public videoUrl: string = '';
  public videos: KeyPair = {
    caminocorrecto: 'https://www.youtube.com/embed/5HU8pUNCpMs',
    cosasclaras: 'https://www.youtube.com/embed/1paz9-hyg30',
    nuevaera: 'https://www.youtube.com/embed/YswuyL8c6ZA',
    mal: 'https://www.youtube.com/embed/oiZOK9MxPNA',
  };

  showModal(value: any, video: string): void {
    if (video) {
      this.videoUrl = this.videos[video] + '?rel=0&autoplay=1';
      this.showVideo = value || this.showVideo === false;
      this.showVideoEvent.emit({
        showVideo: this.showVideo,
        videoUrl: this.videoUrl,
      });
    }
  }
}
