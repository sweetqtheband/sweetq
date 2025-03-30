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
    return new Promise<Record<string, Gig[]>>((resolve, reject) => {
      this.getBands();

      let today = new Date();

      this.get().subscribe((result: any) => {
        const gigs = Object.keys(result).reduce(
          (items: Record<string, Gig[]>, value: string, key: number) => {
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
            result[key].expired
              ? items.past.push(result[key])
              : items.next.push(result[key]);
            return items;
          },
          { past: [], next: [] }
        );

        gigs.next = gigs.next.sort((a: any, b: any) => {
          return a.date > b.date ? 1 : -1;
        });
        gigs.past = gigs.past.sort((a: any, b: any) => {
          return a.date > b.date ? -1 : 1;
        });

        resolve(gigs);
      });
    });
  }

  getBands() {
    this.bandsSvc.getBands().subscribe((bands) => (this.bands = bands));
  }
}
