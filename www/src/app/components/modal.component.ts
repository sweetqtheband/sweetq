import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostBinding,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

import { SystemService } from '@services/system.service';
const system = new SystemService();
@Component({
  selector: 'modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit, OnDestroy, OnChanges {
  // Show or hide modal video
  @Input() show: boolean = false;
  // Video url
  @Input() url: string = '';
  @Output() showChange = new EventEmitter<boolean>();
  @HostBinding('class') hostClass = system.isMobile() ? 'mobile' : 'desktop';

  windowResizeHandler;
  backButtonHandler;

  private vh: number = 0;
  constructor() {
    this.windowResizeHandler = () => {
      this.vh = (window.visualViewport?.height || window.innerHeight) * 0.01;
      document.documentElement.style.setProperty('--vh', `${this.vh}px`);
    };
    this.windowResizeHandler();

    this.backButtonHandler = (event: PopStateEvent) => {
      if (this.show) {
        this.hideVideo();
      } else {
        history.back();
      }
    };
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['show'] && changes['show'].currentValue) {
      history.pushState({ modal: true }, '');
    }
  }

  async ngOnInit() {
    window.addEventListener('popstate', this.backButtonHandler);
    window.addEventListener('resize', this.windowResizeHandler);
  }

  async ngOnDestroy() {
    window.removeEventListener('popstate', this.backButtonHandler);
    window.removeEventListener('resize', this.windowResizeHandler);
  }

  public onShowChanged() {
    this.showChange.emit(this.show);
  }

  hideVideo() {
    this.showChange.emit(false);
  }
}
