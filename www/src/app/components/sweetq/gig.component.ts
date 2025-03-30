import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'sweetq-gig',
  templateUrl: './gig.component.html',
})
export class SweetQGigComponent {
  @Input() gig: any;
  @Output() showModal = new EventEmitter<any>();

  constructor() {}

  showModalHandler(gig: any): void {
    this.showModal.emit(gig);
  }
}
