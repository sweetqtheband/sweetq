import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Video } from '@interfaces/video';

@Injectable()
export class VideosService {
  configUrl = 'assets/json/videos.json';
  constructor(private http: HttpClient) {}

  getVideos() {
    return new Promise<Video[]>((resolve, reject) => {
      this.http
        .get(this.configUrl + '?cb=' + new Date().getTime())
        .subscribe((result: any) => resolve(this.parse(result)));
    });
  }

  parse(data: any): Video[] {
    let parsed = data;
    if (data instanceof Array) {
      parsed = data.map((item: any) => ({
        ...item,
        cover: '/assets/imgs/youtube/videoclips/' + item.id + '.webp',
      }));
    }

    return parsed;
  }
}
