import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Media } from '@interfaces/media';
import { Data } from '@interfaces/data';

type Options = { params?: any; headers?: any };

@Injectable()
export class StreamService {

  apiUrl = environment.apiURL;

  constructor(private http: HttpClient) { }

  getData({ params = null, headers = null }: Options = {}) {
    return new Promise<Data>((resolve, reject) => {
      this.http.get(`${this.apiUrl}/artist/${params.artistId}/track/${params.trackId}`, { headers }).subscribe((res: any) => resolve(res.data));
    });
  }

  getMedia({ params = null, headers = null }: Options = {}) {
    return new Promise<Media[]>((resolve, reject) => {
      this.http.get(`${this.apiUrl}/media`, { params, headers }).subscribe((res: any) => resolve(res.data));
    });
  }

  async getStreamUrl({ id, headers = null }: { id?: string, headers?: any } = {}): Promise<any> {
    const result = await fetch(`${this.apiUrl}/stream/${id}`, { headers });

    const blob = await result.blob();
    return URL.createObjectURL(blob);
  }
}