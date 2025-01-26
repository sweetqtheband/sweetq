import { Component, Input } from '@angular/core';
import { Media } from '@interfaces/media';

@Component({
  selector: 'sweetq-album',
  templateUrl: './album.component.html',
  styleUrls: ['./album.component.scss'],
})
export class SweetQAlbumComponent {
  @Input('item') item: Media = { id: '' };

  itemStyle(item: Media): Object {
    const root = document.documentElement; // Elemento raíz (html)
    root.style.setProperty(
      '--background-image',
      item.cover ? `url("/assets/imgs/cover/${item.cover}")` : null
    ); // Cambiar la variable CSS

    return {};
  }
}
