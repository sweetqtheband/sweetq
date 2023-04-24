import { Component, OnDestroy, OnInit } from '@angular/core';

  @Component({
    selector: 'home-view',
    templateUrl: './home.component.html',  
  })
  
  export class HomeComponent implements OnInit, OnDestroy {
    windowResizeHandler;
    
    public halfGigs = true;
    public halfVideos = true;        
    public playAlbum = false;   
    public showVideo = false;
    public videoUrl = '';
    public showMap = false;
    public mapUrl = '';
    public gigHref = null;
    public presaveHref = "https://accounts.spotify.com/authorize?client_id=52bb6de395384e7bb580f44922501752&redirect_uri=https%3A%2F%2Fampl.ink%2Fpresave%2Fcallback%2Fspotify&scope=user-follow-modify+user-library-modify&response_type=code&state=MMe2M";
   
    
    constructor() {
        this.windowResizeHandler = () => {
            this.setWidths();
        }     
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
      window.addEventListener('resize', this.windowResizeHandler);
    }
  
    ngOnDestroy()
    {
      window.removeEventListener('resize', this.windowResizeHandler);
    }
  };
    