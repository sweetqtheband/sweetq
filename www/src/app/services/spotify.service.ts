import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import config from '../config'
import { Buffer } from 'buffer';
import Dexie, {Table} from 'dexie';
import { EventEmitterService } from './eventEmitter.service';

export interface Codes {    
    type: string,
    code?: string
}

@Injectable()
export class SpotifyService {

  private db: any;
  private table!: Table<Codes, string>;
  private access_token: any = null;
  private config = config.spotify;

  private eps = {
    base: {
      accounts: "https://accounts.spotify.com",
      api: "https://api.spotify.com",
      open: "https://open.spotify.com"
    },
    authorize: "/authorize",
    api: "/api",
    token: "/token",
    version: "/v1",
    me: {      
      albums: "/me/albums",
      savedAlbums: "/me/albums/contains"
    }
  }

  constructor(private http: HttpClient, private ea: EventEmitterService) {
    this.initDB();
  }

  private initDB() {
    this.db = new Dexie('spotify');
    this.db.version(1).stores({
      codes: '++id, type, code'
    });
    
    this.table = this.db.table('codes');
  }

  getEmbedUrl() {
    return `${this.eps.base.open}/embed/${config.spotify.releaseType}/${config.spotify.release}?utm_source=generator&theme=0`;
  }

  async getCode() {
    const storedCode = await this.table.get({type: 'spotify'});
    return storedCode?.code ?? null;
  }

  getHeaders(asJson = false) {    
    const client_id = Buffer.from(this.config.clientId, 'base64').toString();            
    const client_secret = Buffer.from(this.config.clientSecret, 'base64').toString();                  
    const authorization = this.access_token ? this.access_token : Buffer.from(client_id + ':' + client_secret).toString('base64');    

    const headers = new HttpHeaders()
    .set('Authorization', `${this.access_token ? 'Bearer' : 'Basic'} ${authorization}`)
    .set('Content-Type', `application/${asJson ? 'json' : 'x-www-form-urlencoded'}`);

    return headers;
  }

  async getToken() {

    let token = await this.table.get({type: 'spotify_tk'});

    let returning = null;
    
    if (token)
    {            
       returning = JSON.parse(token.code as string);       
       this.access_token = returning.access_token;
    } else {
      
      const code:any = await this.getCode();                  

      const body = new HttpParams({fromObject: { 
        grant_type: 'authorization_code',      
        code,
        redirect_uri: `${location.origin}/callback`
      }});            

      const headers = this.getHeaders();
      
      returning = await new Promise((resolve:any) => {    
        this.http.post(`${this.eps.base.accounts}${this.eps.api}${this.eps.token}`, body.toString(), {headers})
        .subscribe((result:any) => {
          (async () => {
            this.access_token = result.access_token;
            await this.table.add({type: 'spotify_tk', code: JSON.stringify(result)});
            resolve(result);
          })()
        })
      });
    }

    return returning;
  }

  async preSave() {
    await this.getToken();
    const followed = await this.checkNextRelease();        
    if (!followed) {
      await this.storeNextRelease();
    }

    this.ea.trigger('toast:add', 'presave.done.spotify');
  }

  async getStoredAlbums() {
    const headers = this.getHeaders();    
    return await new Promise((resolve:any) => {
      this.http.get(`${this.eps.base.api}${this.eps.version}${this.eps.me.albums}`, {headers}).subscribe((result:any) => {
        resolve(result);
      });
    });
  }

  async checkNextRelease() {
    const headers = this.getHeaders();    
    return await new Promise((resolve:any) => {
      this.http.get(`${this.eps.base.api}${this.eps.version}${this.eps.me.savedAlbums}?ids=${config.spotify.nextRelease}`, {headers}).subscribe((result:any) => {
        resolve(result[0]);
      });
    });
  }

  async storeNextRelease() {
    const headers = this.getHeaders(true);    
    return await new Promise((resolve:any) => {
      const body = {
        ids: [config.spotify.nextRelease]
      };
      this.http.put(`${this.eps.base.api}${this.eps.version}${this.eps.me.albums}`, JSON.stringify(body), {headers}).subscribe((result:any) => {
        resolve(result);
      });
    });
  }

  async authorize() {         
    if (!await this.getCode())
    {
      const client_id = Buffer.from(this.config.clientId, 'base64').toString();            

      const urlParams = new HttpParams({fromObject: {
          response_type: 'code',
          client_id,
          scope: 'user-follow-modify user-library-modify user-library-read user-follow-read',
          redirect_uri: `${location.origin}/callback`,
          state: 'SWEETQ'
      }});    
            
      return `${this.eps.base.accounts}${this.eps.authorize}?${urlParams.toString()}`;     
    } else {          
      return '';
    }
  }

  async setCode(code:string) {    
    await this.table.add({type: 'spotify', code});        
    await this.preSave();
  }
}