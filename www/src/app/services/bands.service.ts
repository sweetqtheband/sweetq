import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class BandsService {

  configUrl = 'assets/json/bands.json';    
  constructor(private http: HttpClient) { }

  getBands() {
    return this.http.get(this.configUrl + '?cb=' + new Date().getTime());
  }
}