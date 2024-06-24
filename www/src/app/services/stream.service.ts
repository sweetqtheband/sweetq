import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Media } from '@interfaces/media';

type Options = { params?: any; headers?: any, trackId?: string|null };

@Injectable()
export class StreamService {
  apiUrl = environment.apiURL;

  constructor(private http: HttpClient) {}

  getMedia({ params = null, headers = null }: Options = {}) {
    return new Promise<Media[]>((resolve, reject) => {
      this.http
        .get(`${this.apiUrl}/media`, { params, headers })
        .subscribe((res: any) => {
          resolve(
            res.data.map((track: any, index: number) => {
              track.date = new Date(track.date);
              let nextId = index === res.data.length - 1 ? 0 : index + 1;
              track.ended = false;
              track.nextId = res.data[nextId].id;
              return track;
            })
          );
        });
    });
  }

  getTrack({ params = null, headers = null, trackId = null }: Options = {}) {
    return new Promise<Media>((resolve, reject) => {
      if (trackId)
      {
        this.http
          .get(`${this.apiUrl}/media/${trackId}`, { params, headers })
          .subscribe((res: any) => {
            const track = res.data;                    
            track.date = new Date(track.date);            
            track.ended = false;     
            track.spotify = track.spotifyId ? {
              url : `https://open.spotify.com/${track.spotifyId}`,
              embedUrl : `https://open.spotify.com/embed/${track.spotifyId}`
            } : null;
            track.apple = track.appleId ? {
              url: `https://music.apple.com/es/${track.appleId}`
            } : null;

            resolve(track);            
          });
      } else {
        reject(new Error('No trackId sent'));
      }
    });
  }

  async getStreamUrl({
    id,
    headers = null,
  }: { id?: string; headers?: any } = {}): Promise<any> {
    const result = await fetch(`${this.apiUrl}/stream/${id}`, { headers });

    const blob = await result.blob();
    return URL.createObjectURL(blob);
  }
}
