import { Component, ViewEncapsulation } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import { Angulartics2GoogleAnalytics } from 'angulartics2';
import { GigsService } from './gigs.service';
import { Gig } from './interfaces/gig';
import * as moment from 'moment';


@Component({
  selector: 'body',  
  templateUrl: './app.component.html',
  styleUrls: ['../assets/css/reset.css',
              '../assets/css/style.css'
            ],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  public gigs:Gig[];  
  public halfGigs = true;
  public halfVideos = true;
  public release = true;
  public showVideo = false;
  public playAlbum = false;
  public gigHref = null;
  public videoUrl = null;  
  public videos = { nuevaera: "https://www.youtube.com/embed/YswuyL8c6ZA",
                    mal: "https://www.youtube.com/embed/oiZOK9MxPNA",
                    cosasclaras: "https://www.youtube.com/embed/1paz9-hyg30"
                  }
  public links = { spotify: "https://open.spotify.com/album/2sLEzbmAKph9t2qIVWyiFh",
                   amazon: "https://www.amazon.es/Nueva-Era-Sweet-Q/dp/B075G6WQYW",
                   appleMusic: "https://itunes.apple.com/us/album/la-nueva-era-ep/id1280668188",
                   googlePlay: "https://play.google.com/store/music/album/Sweet_Q_La_Nueva_Era?id=Bcyjv2sp5jvkk3td7mxdkyogdom"
                 };
  public target = '_blank';                                                  

  windowResizeHandler;

  constructor(angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics, 
              translate: TranslateService, 
              private gigsSvc: GigsService) {
                                

      translate.setDefaultLang('en');
      let language = String(navigator.language).split("-");

      translate.use(language[0]);
      moment.locale(language[0]);

      this.windowResizeHandler = e => {
        this.setWidths();
      }     
  }

  showModal(value?:boolean, video?:string):void {    
    this.videoUrl = this.videos[video] + "?rel=0&autoplay=1";    
    this.showVideo = value ? value : (this.showVideo == false ? true : false);        
  }

  showSpotifyModal(value?:boolean):void {
    this.playAlbum = value ? value : (this.playAlbum == false ? true : false);
  }

  async getGigs()
  {
    this.gigsSvc.getGigs().then(gigs => {      
      this.gigs = gigs.filter(gig => !gig.expired);    
    });    
  }

  setWidths()
  {
    if (window.innerWidth <= 906)
    {
      this.halfGigs = false;
    } else {
      this.halfGigs = true;
    }

    if (window.innerWidth < 600)
    {
      this.halfVideos = false;
    } else {
      this.halfVideos = true;
    }
  }

  

  ngOnInit() {
    this.setWidths();

    if (!this.release)
    {
      Object.keys(this.links).map(key => {
        this.links[key] = "#";
        this.target = "_self";
      });
    }

    this.getGigs();

    window.addEventListener('resize', this.windowResizeHandler);
  }

  ngOnDestroy()
  {
    window.removeEventListener('resize', this.windowResizeHandler);
  }
}