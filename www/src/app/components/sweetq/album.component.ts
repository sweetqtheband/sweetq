import { Component, Input } from '@angular/core';
import { Media } from '@interfaces/media';

@Component({
  selector: 'sweetq-album',
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.scss'],
})
export class SweetQAlbumComponent {
  @Input('item') item: Media = {id: ""};

  itemStyle(item: Media): Object {
    return {
      'background-image': item.cover
        ? `url("/assets/imgs/cover/${item.cover}")`
        : null,
    };
  }
}