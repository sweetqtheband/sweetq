import {    
    Component,      
    OnInit,
    Input,
    Output,
    EventEmitter
} from '@angular/core';

import { GigsService } from '@services/gigs.service';
import { Gig } from '@interfaces/gig';


@Component({
    selector: 'sweetq-gigs',
    templateUrl: './gigs.component.html',  
})

export class SweetQGigsComponent implements OnInit {                 
    @Input() halfGigs: boolean = false;
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