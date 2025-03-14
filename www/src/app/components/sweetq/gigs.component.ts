import {    
    Component,      
    OnInit,
    Output,
    EventEmitter
} from '@angular/core';

import { GigsService } from '@services/gigs.service';
import { Gig } from '@interfaces/gig';
import { Band } from '@interfaces/band';


@Component({
    selector: 'sweetq-gigs',
    templateUrl: './gigs.component.html',  
})

export class SweetQGigsComponent implements OnInit {                 
    @Output() showMapEvent = new EventEmitter<any>();

    public showMap:boolean = false;
    public mapUrl?:string = '';  
    public gigs:Gig[] = [];      
    
    constructor(private gigsSvc: GigsService) {
        
    }
    
    ngOnInit() {
        this.getGigs();
    }    

    async getGigs()
    {
      this.gigs = await this.gigsSvc.getGigs();
      this.gigs = this.gigs.map((gig:Gig) : Gig => {
          gig.bands = gig.bands.map((band:Band) : Band => {
          band.link = band.facebook ?? band.instagram;
          band.link = band.link ?? '#';
          return band;
        })
        return gig;
      });
    }

    showModal(gig:Gig):void {    
      if (gig)
      {
        this.mapUrl = gig?.map;    
        this.showMap = !!gig?.map;        
        this.showMapEvent.emit({showMap: this.showMap, mapUrl: this.mapUrl});
      }
    }
}