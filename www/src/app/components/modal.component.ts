

import {    
    Component,
    Input,
    Output,
    EventEmitter    
  } from '@angular/core';


  @Component({
    selector: 'modal',
    templateUrl: './modal.component.html',  
  })
  
  
  export class ModalComponent {

  
    // Show or hide modal video
    @Input() show: boolean = false;
    // Video url
    @Input() url: string = '';
    @Output() showChange = new EventEmitter<boolean>();      

    public onShowChanged() {    
      this.showChange.emit(this.show);
    }

    
    hideVideo()
    {      
      this.showChange.emit(false);
    }
  }