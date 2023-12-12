import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { News } from '@interfaces/news';

@Injectable()
export class NewsService {
  configUrl = 'assets/json/news.json';
  constructor(private http: HttpClient) {}

  getNews() {
    return new Promise<News[]>((resolve, reject) => {
      this.http
        .get(this.configUrl + '?cb=' + new Date().getTime())
        .subscribe((result: any) => resolve(result));
    });
  }
}
