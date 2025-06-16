import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

import { GigsService } from '@services/gigs.service';
import { Gig } from '@interfaces/gig';
import { Band } from '@interfaces/band';

@Component({
  selector: 'sweetq-gigs',
  templateUrl: './gigs.component.html',
  styleUrls: ['./gigs.component.scss'],
})
export class SweetQGigsComponent implements OnInit {
  @Output() showMapEvent = new EventEmitter<any>();

  public showMap: boolean = false;
  public mapUrl?: string = '';
  public pastExpanded: boolean = false;
  public next: Gig[] = [];
  public past: Gig[] = [];

  constructor(private gigsSvc: GigsService) {}

  ngOnInit() {
    this.getGigs();
  }

  async getGigs() {
    const { next, past } = await this.gigsSvc.getGigs();

    this.next = next.map(
      (gig: Gig): Gig => ({
        ...gig,
        bands: gig.bands.map((band: Band): Band => {
          if (band) {
            band.link = band?.facebook ?? band?.instagram;
            band.link = band?.link ?? '#';
            return band;
          }
          return { id: 0, name: '', link: '' } as Band;
        }),
      })
    );

    this.past = past.map(
      (gig: Gig): Gig => ({
        ...gig,
        bands: gig.bands.map((band: Band): Band => {
          if (band) {
            band.link = band?.facebook ?? band?.instagram;
            band.link = band?.link ?? '#';
            return band;
          }
          return { id: 0, name: '', link: '' } as Band;
        }),
      })
    );
  }

  showModal(gig: Gig): void {
    if (gig) {
      this.mapUrl = gig?.map;
      this.showMap = !!gig?.map;
      this.showMapEvent.emit({ showMap: this.showMap, mapUrl: this.mapUrl });
    }
  }
}
