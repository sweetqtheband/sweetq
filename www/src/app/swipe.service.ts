import { Injectable } from '@angular/core';

@Injectable()
export class SwipeService {
    
    touchStartHandler;
    touchMoveHandler;

    xDown = null;                                                        
    yDown = null;   
    element = null;

    constructor() { 
        this.touchStartHandler = e => {
            this.touchStart(e);
        }

        this.touchMoveHandler = e => {
            this.touchMove(e);
        }   
    }

    touchStart(evt) {                                         
        this.xDown = evt.touches[0].clientX;                                      
        this.yDown = evt.touches[0].clientY;                                      
    }                                                

    touchMove(evt) {
        if ( ! this.xDown || ! this.yDown ) {
            return;
        }

        let xUp = evt.touches[0].clientX;                                    
        let yUp = evt.touches[0].clientY;

        let xDiff = this.xDown - xUp;
        let yDiff = this.yDown - yUp;

        if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
            if ( xDiff > 0 ) {
                /* left swipe */ 
                console.log("LEFT SWIPE");
            } else {
                /* right swipe */
                console.log("RIGHT SWIPE");
            }                       
        } else {
            if ( yDiff > 0 ) {
                /* up swipe */ 
                console.log("UP SWIPE");
            } else { 
                /* down swipe */
                console.log("DOWN SWIPE");
            }                                                                 
        }
        /* reset values */
        this.xDown = null;
        this.yDown = null;                                             
    };

    add(element)
    {
        this.element = element;
        this.element.addEventListener('touchstart', this.touchStartHandler, false);        
        this.element.addEventListener('touchmove', this.touchMoveHandler, false);
    }

    destroy()
    {
        this.element.removeEventListener('touchstart', this.touchStartHandler, false);        
        this.element.removeEventListener('touchmove', this.touchMoveHandler, false);
    }
  
}