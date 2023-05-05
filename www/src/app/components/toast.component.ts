

import {    
    Component    
  } from '@angular/core';
import { EventEmitterService } from '@services/eventEmitter.service';


  @Component({
    selector: 'toast',
    templateUrl: './toast.component.html',
    styleUrls: ['./toast.component.scss'],  
  })

  
  export class ToastComponent {

    toasts:Array<any> = []
    
   constructor(private ea:EventEmitterService) {
    this.ea.subscribe('toast:add', (text:string) => this.add(text));
   }

   add(text:string) {
    const toast = {class: 'hidden', text};
    this.toasts.push(toast);   
    setTimeout(() => { 
      toast.class = '';      
    }, 0);

    setTimeout(() => {
      this.toasts.splice(0, 1);
    }, 5000)
   }

  }