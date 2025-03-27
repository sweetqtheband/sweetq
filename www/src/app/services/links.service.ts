import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Links } from '@interfaces/links';

@Injectable()
export class LinksService {
  constructor(private http: HttpClient) {}

  getLinks() {
    const configUrl = 'assets/json/links.json';

    return new Promise<Links[]>((resolve, reject) => {
      this.http
        .get(configUrl + '?cb=' + new Date().getTime())
        .subscribe((result: any) => resolve(result));
    });
  }
}
