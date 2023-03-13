import {    
    Component,
    OnInit,
    OnDestroy,
    ElementRef,
    Input,
    Output,
    EventEmitter
  } from '@angular/core';

  @Component({
    selector: 'spotify',
    templateUrl: './spotify.component.html',  
  })
  
  export class SpotifyComponent implements OnInit, OnDestroy {
    
    // reference to the element itself, we use this to access events and methods
    private _elementRef: ElementRef
  
    // Show or hide modal video
    @Input() show: boolean;
    @Output() showChange = new EventEmitter<boolean>(); 
    
    // constructor initializes our declared vars
    constructor(elementRef: ElementRef) {

    }

    public onShowChanged() {
      this.showChange.emit(this.show);
    }

    hideSpotify()
    {      
      this.showChange.emit(false);
    }

    ngOnInit() { }

    ngOnDestroy() {}
  }