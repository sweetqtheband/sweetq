import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostBinding,
} from '@angular/core';

import { SystemService } from '@services/system.service';
const system = new SystemService();
@Component({
  selector: 'modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent {
  // Show or hide modal video
  @Input() show: boolean = false;
  // Video url
  @Input() url: string = '';
  @Output() showChange = new EventEmitter<boolean>();
  @HostBinding('class') hostClass = system.isMobile() ? 'mobile' : 'desktop';

  public onShowChanged() {
    this.showChange.emit(this.show);
  }

  hideVideo() {
    this.showChange.emit(false);
  }
}
