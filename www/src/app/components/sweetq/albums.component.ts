import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Media } from '@interfaces/media';
import { DateService } from '@services/date.service';

@Component({
  selector: 'sweetq-albums',
  templateUrl: './albums.component.html',
  styleUrls: ['./albums.component.scss'],
})
export class SweetQAlbumsComponent implements OnChanges {
  @ViewChild('scroll') _scroll!: ElementRef<HTMLDivElement>;
  @Input('title') title: string = '';
  @Input('items') items: Media[] = [];
  @Input('initial-id') initial: string = '';
  @Output() onPlay = new EventEmitter<string>();
  protected isReady: boolean = false;
  protected isGrabbed: boolean = false;
  protected isGrabbing: boolean = false;

  constructor(private dateSvc: DateService) {}

  scrollTo(delta: number) {
    
    const scroll = this._scroll.nativeElement;
    const els:any[] = [].slice.call(scroll.children);
    const elWidth = els.length > 1 ? els.at(1).offsetLeft - scroll.scrollLeft : els.at(0).clientWidth;    

    const advance =
      els.length > 1 ? els.at(1).offsetLeft * delta : 0;

    let left = Math.round(scroll.scrollLeft + advance);
    
    
    if (left < elWidth)
    {
      left = 0;        
    } else if (els.length > 2 && left > els.at(-2).offsetLeft) {
      left = els.at(-2).offsetLeft;
    }


    scroll.scrollTo({ left, behavior: 'smooth' });
  }

  onMouseWheel(e: WheelEvent) {
    e.preventDefault();

    this.scrollTo(e.deltaY > 0 ? 1 : -1);    
  }
  onMouseUp(e: MouseEvent) {
    e.preventDefault();
    this.isGrabbed = false;
    this.isGrabbing = false;
  }
  onMouseDown(e: MouseEvent) {
    e.preventDefault();
    this.isGrabbed = true;
    this.isGrabbing = false;
  }
  onMouseLeave(e: MouseEvent) {
    e.preventDefault();
    this.isGrabbed = false;
    this.isGrabbing = false;
  }
  onMouseMove(e: MouseEvent) {
    e.preventDefault();
    if (this.isGrabbed) {            
      this.isGrabbing = true;      
      this.scrollTo(e.movementX > 0 ? -1 : 1);      
    }
  }

  itemDate(item: Media): Object {
    return this.dateSvc.format(
      `short.${item.status === 'upcoming' ? 'month' : 'day'}`,
      item.date
    );
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

  scrollClass(): Object {
    return {
      grab: this.isGrabbed,
      grabbing: this.isGrabbing,
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
    if (changes['initial'].currentValue) {
      const item = this.items.find(
        (item) => item.id === changes['initial'].currentValue
      );
      if (item) {
        this.playItem(item.id);
      }
    }
  }
}
