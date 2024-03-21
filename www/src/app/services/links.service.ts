import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Links } from '@interfaces/links';

@Injectable()
export class LinksService {
  configUrl = 'assets/json/links.json';
  constructor(private http: HttpClient) {}

  getLinks() {
    return new Promise<Links[]>((resolve, reject) => {
      this.http
        .get(this.configUrl + '?cb=' + new Date().getTime())
        .subscribe((result: any) => resolve(result));
    });
  }
}
