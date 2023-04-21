import {    
    Component,      
    OnInit,
    Input
} from '@angular/core';

import { GigsService } from '@services/gigs.service';
import { Gig } from '@interfaces/gig';


@Component({
    selector: 'sweetq-gigs',
    templateUrl: './gigs.component.html',  
})

export class SweetQGigsComponent implements OnInit {                 
    @Input() halfGigs: boolean = false;

    public gigs:Gig[] = [];      
    
    constructor(private gigsSvc: GigsService) {
        
    }
    
    ngOnInit() {
        this.getGigs();
    }    

    async getGigs()
    {
      this.gigsSvc.getGigs().then(gigs => {      
        this.gigs = gigs.filter(gig => !gig.expired);    
      });    
    }
}