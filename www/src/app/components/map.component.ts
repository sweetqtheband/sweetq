import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent {
  // Show or hide modal map
  @Input() show: boolean = false;
  // Map url
  @Input() url: string = '';
  @Output() showChange = new EventEmitter<boolean>();

  public onShowChanged() {
    this.showChange.emit(this.show);
  }

  hideMap() {
    this.showChange.emit(false);
  }
}
