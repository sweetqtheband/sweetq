import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BandsService } from './bands.service';
import * as moment from 'moment';
import { Gig } from './interfaces/gig';

@Injectable()
export class GigsService {

  bands;

  configUrl = 'assets/json/gigs.json';    
  constructor(private http: HttpClient, private bandsSvc: BandsService) { }

  get() {
        return this.http.get(this.configUrl + '?cb=' + new Date().getTime());
  }

  getGigs ()
  { 
    return new Promise<Gig[]>((resolve, reject) => {   
      this.getBands();

      let today = moment();

      this.get().subscribe((result:Gig[]) => {      
        Object.keys(result).map(key => {
          let bands = [];

          let date = moment(result[key].date);

          if (date.isBefore(today))
          {
            result[key].expired = true;
          } else {
            result[key].expired = false
          }
          result[key].day = date.format('DD');
          result[key].month = date.format('MMM').replace(".", "");
          
          result[key].bands.map(bandId => {
            let bandData = this.bands.find(band => { return bandId == band.id});
            if (bandData)
            {
              bands.push(bandData);
            }
          })

          result[key].bands = bands;
        });      

        resolve(result);
      });
    });
  }

  getBands()
  {
    this.bandsSvc.getBands().subscribe(bands => this.bands = bands);
  }
}