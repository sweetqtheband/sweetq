import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BandsService } from '@services/bands.service';
import * as moment from 'moment';
import { Gig } from '@interfaces/gig';
import { Band } from '@interfaces/band';

@Injectable()
export class GigsService {

  bands: any = [];

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

      this.get().subscribe((result:any) => {      
        Object.keys(result).forEach((value:string, key: number) => {
          let bands:Array<Band> = [];

          let date = moment(result[key].date);

          if (date.isBefore(today))
          {
            result[key].expired = true;
          } else {
            result[key].expired = false
          }
          result[key].day = date.format('DD');
          result[key].month = date.format('MMM').replace(".", "");
          
          bands = result[key].bands.filter((bandId:any) => {
            let bandData = this.bands.find((band:any) => { return bandId == band.id});
            return bandData;
          })

          result[key].bands = bands;
        });      

        resolve(result.sort((a:any,b:any) => !a.expired && b.expired ? -1 : 1));
      });
    });
  }

  getBands()
  {
    this.bandsSvc.getBands().subscribe(bands => this.bands = bands);
  }
}