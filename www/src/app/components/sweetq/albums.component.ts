import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Media } from '@interfaces/media';
import { DateService } from '@services/date.service';

@Component({
  selector: 'sweetq-albums',
  templateUrl: './albums.component.html',
  styleUrls: ['./albums.component.scss']
})
export class SweetQAlbumsComponent implements OnChanges {
  @Input('title') title: string = '';
  @Input('items') items: Media[] = [];
  @Input('initial-id') initial: string = '';
  @Output() onPlay = new EventEmitter<string>();
  protected isReady:boolean = false;

  constructor(private dateSvc: DateService) {}

  itemDate(item:Media):Object {
    return this.dateSvc.format(`short.${item.status === 'upcoming' ? 'month':'day'}`, item.date);
  }

  itemStyle(item: Media): Object {
    return {
      'background-image': item.cover
        ? `url("/assets/imgs/cover/${item.cover}")`
        : null,
    };
  }

  itemClass(item: Media): Object {
    return {
      current: item.isPlaying,
      [item.status as string]: true,
    };
  }

  playItem(id: string) {
    const item = this.items.find((item) => item.id === id);
    if (item) {
      this.onPlay.emit(id);
      const event: CustomEvent = new CustomEvent('playNext', {
        bubbles: true,
        detail: { id },
      });
      window.dispatchEvent(event);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.isReady = true;
    if (changes['initial'].currentValue)
    {    
      const item = this.items.find(item => item.id === changes['initial'].currentValue)
      if (item) {
        this.playItem(item.id);
      }
    }
  }
}
