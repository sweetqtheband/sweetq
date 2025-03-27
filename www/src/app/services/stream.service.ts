import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Media } from '@interfaces/media';
import { Album } from '@interfaces/album';

type Options = {
  params?: any;
  headers?: any;
  trackId?: string | null;
  albumId?: string | null;
};

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

  getAlbum({ params = null, headers = null, albumId = null }: Options = {}) {
    return new Promise<Album>((resolve, reject) => {
      if (albumId) {
        this.http
          .get(`${this.apiUrl}/media/album/${albumId}`, { params, headers })
          .subscribe((res: any) => {
            const album = res.data;

            album.tracks = album.tracks.map(
              (track: any, index: number) =>
                ({
                  ...track,
                  date: new Date(track.date),
                  ended: false,
                  nextId:
                    index === album.tracks.length - 1
                      ? album.tracks[0].id
                      : album.tracks[index + 1].id,
                  previousId: !index
                    ? album.tracks[album.tracks.length - 1].id
                    : album.tracks[index - 1].id,
                  description: track.description
                    ? track.description.replaceAll('\n', '<br/>')
                    : null,
                  lyrics: track.lyrics
                    ? track.lyrics.replaceAll('\n', '<br/>')
                    : null,
                  spotify: track?.links?.spotify
                    ? {
                        url: `https://open.spotify.com/${track.links.spotify}`,
                        embedUrl: `https://open.spotify.com/embed/${track.spotify}`,
                      }
                    : null,
                  apple: track?.links?.apple
                    ? {
                        url: `https://music.apple.com/es/${track.links.apple}`,
                      }
                    : null,
                  amazon: track?.links?.amazon
                    ? {
                        url: `https://www.amazon.com/${track.links.amazon}`,
                      }
                    : null,
                  youtubeMusic: track?.links?.youtube
                    ? {
                        url: `https://music.youtube.com/${track.links.youtube}`,
                      }
                    : null,
                } as Media)
            );

            resolve(album);
          });
      }
    });
  }

  getTrack({ params = null, headers = null, trackId = null }: Options = {}) {
    return new Promise<Media>((resolve, reject) => {
      if (trackId) {
        const ep = params?.public
          ? `${this.apiUrl}/public/track/${trackId}`
          : `${this.apiUrl}/media/${trackId}`;
        this.http.get(ep, { params, headers }).subscribe((res: any) => {
          const track = res.data;
          track.date = new Date(track.date);
          track.ended = false;
          track.description = track.description
            ? track.description.replaceAll('\n', '<br/>')
            : null;
          track.lyrics = track.lyrics
            ? track.lyrics.replaceAll('\n', '<br/>')
            : null;
          track.spotify = track?.links?.spotify
            ? {
                url: `https://open.spotify.com/${track.links.spotify}`,
                embedUrl: `https://open.spotify.com/embed/${track.links.spotify}`,
              }
            : null;
          track.apple = track?.links?.apple
            ? {
                url: `https://music.apple.com/es/${track.links.apple}`,
              }
            : null;
          track.amazon = track?.links?.amazon
            ? {
                url: `https://www.amazon.com/${track.links.amazon}`,
              }
            : null;
          track.youtubeMusic = track?.links?.youtube
            ? {
                url: `https://music.youtube.com/${track.links.youtube}`,
              }
            : null;

          resolve(track);
        });
      } else {
        reject(new Error('No trackId sent'));
      }
    });
  }

  downloadTrack({
    params = null,
    headers = null,
    trackId = null,
  }: Options = {}) {
    return new Promise<Blob>((resolve, reject) => {
      if (trackId) {
        this.http
          .get(`${this.apiUrl}/media/${trackId}/download`, {
            params,
            headers,
            responseType: 'blob',
          })
          .subscribe((res: any) => {
            resolve(res);
          });
      } else {
        reject(new Error('No trackId sent'));
      }
    });
  }

  async getStreamMetadata({
    id,
    headers = null,
  }: { id?: string; headers?: any } = {}): Promise<any> {
    const response = await fetch(`${this.apiUrl}/metadata-stream/${id}`, {
      headers,
    });
    return response.json();
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
