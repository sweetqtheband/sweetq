import {    
    Component, Input
} from '@angular/core';
import { Media } from '@interfaces/media';
import { StreamService } from '@services/stream.service';

@Component({
    selector: 'sweetq-track-download',
    templateUrl: './track-download.component.html',  
})

export class SweetQTrackDownloadComponent {    
  @Input() public item: Media = { id: '' };
  @Input() public tid: string|null = null;

  get headers(): any {
    return { TID: this.tid };
  }

  constructor(private readonly http: StreamService) {}

  async download() {
    const blob = await this.http.downloadTrack({
      headers: this.headers,
      trackId: this.item.id,
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sweet Q - ${this.item.title} (320kbps).mp3`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

}