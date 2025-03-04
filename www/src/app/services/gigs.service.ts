import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BandsService } from '@services/bands.service';
import { Gig } from '@interfaces/gig';
import { Band } from '@interfaces/band';

@Injectable()
export class GigsService {
  bands: any = [];

  configUrl = 'assets/json/gigs.json';
  constructor(private http: HttpClient, private bandsSvc: BandsService) {}

  get() {
    return this.http.get(this.configUrl + '?cb=' + new Date().getTime());
  }

  getGigs() {
    return new Promise<Gig[]>((resolve, reject) => {
      this.getBands();

      let today = new Date();

      this.get().subscribe((result: any) => {
        Object.keys(result).forEach((value: string, key: number) => {
          let bands: Array<Band> = [];

          let date = new Date(result[key].date);

          if (date < today) {
            result[key].expired = true;
          } else {
            result[key].expired = false;
          }
          result[key].day = date.toLocaleDateString(navigator.language, {
            day: '2-digit',
          });
          result[key].month = date.toLocaleDateString(navigator.language, {
            month: 'short',
          });
          result[key].year = date.toLocaleDateString(navigator.language, {
            year: 'numeric',
          });

          bands = result[key].bands.map((bandId: any) => {
            let bandData = this.bands.find((band: any) => {
              return bandId == band.id;
            });
            return bandData;
          });

          result[key].bands = bands;
        });

        resolve(
          result.sort((a: any, b: any) => (!a.expired && b.expired ? -1 : 1))
        );
      });
    });
  }

  getBands() {
    this.bandsSvc.getBands().subscribe((bands) => (this.bands = bands));
  }
}
