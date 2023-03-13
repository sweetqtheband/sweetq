

import {    
    Component,
    OnInit,
    OnDestroy,
    ElementRef,
    Input,
    Output,
    EventEmitter,    
    Pipe,
    PipeTransform
  } from '@angular/core';

  import {SwipeService} from './swipe.service';

  @Component({
    selector: 'modal',
    templateUrl: './modal.component.html',  
  })
  
  export class ModalComponent implements OnInit, OnDestroy {
    
    // reference to the element itself, we use this to access events and methods
    private _elementRef: ElementRef
  
    // Show or hide modal video
    @Input() show: boolean;
    // Video url
    @Input() url: string;
    @Output() showChange = new EventEmitter<boolean>(); 
     
    
    // constructor initializes our declared vars
    constructor(elementRef: ElementRef, private swipeSvc: SwipeService) {         

    }    

    public onShowChanged() {    
      this.showChange.emit(this.show);
    }

    
    hideVideo()
    {      
      this.showChange.emit(false);
    }

    ngOnInit() {   
      
    }

    ngOnDestroy() {
      
    }
  }