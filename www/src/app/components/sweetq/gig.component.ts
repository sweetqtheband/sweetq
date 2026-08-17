import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'sweetq-gig',
  templateUrl: './gig.component.html',
})
export class SweetQGigComponent {
  @Input() gig: any;
  @Output() showModal = new EventEmitter<any>();

  constructor() {}

  get hasTickets(): boolean {
    return (
      (this.gig.event || this.gig.tickets) &&
      !this.gig.expired &&
      this.gig.tickets !== 'free'
    );
  }

  get isFree(): boolean {
    return this.gig.tickets === 'free';
  }

  showModalHandler(gig: any): void {
    this.showModal.emit(gig);
  }
}
