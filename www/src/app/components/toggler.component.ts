import { Component, ElementRef, HostListener, QueryList, ContentChildren, Input, HostBinding, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'toggler-item',
  template: `
    <ng-content select="[handler]"></ng-content>
    <div class="content"><ng-content class="content"></ng-content></div>
  `,
})
export class TogglerItemComponent implements OnInit {
  @Input() open: boolean = true;
  @HostBinding('class.open') isOpen: boolean = true;

  constructor(public el: ElementRef) {}

  @HostListener('click', ['$event.target'])
  clickHandler() {
    this.isOpen = !this.isOpen;

    this.dispatchOpen();
  }

  dispatchOpen() {
    setTimeout(() => {
      this.el.nativeElement.dispatchEvent(
        new CustomEvent('open', {
          bubbles: true,
          cancelable: true,
          composed: true 
        })
      );
    }, 0);
  }

  ngOnInit(): void {
    this.isOpen = this.open;
    this.dispatchOpen();
  }

}

@Component({
  selector: 'toggler',
  styleUrls: ['./toggler.component.scss'],
  template: `<ng-content></ng-content>`,
})
export class TogglerComponent {  
  @ContentChildren(TogglerItemComponent) handlers: QueryList<ElementRef> | undefined;    
  @Output()
  isOpen = new EventEmitter<string[]>(false);
  
  
  @HostListener('open', ['$event'])
  toggleOpenHandler(event:Event) {
    event.preventDefault();

    const isOpen = this.handlers?.filter((handler: any) =>
      handler.el.nativeElement.classList.contains('open')
    ).map((handler: any) => handler.el.nativeElement.dataset.id);

    this.isOpen.emit(isOpen);
  }
}
