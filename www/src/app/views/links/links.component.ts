import {    
  Component, ViewEncapsulation
} from '@angular/core';

@Component({
  selector: 'links-view',
  templateUrl: './links.component.html',  
  styleUrls: [
    '../../../assets/css/fonts.css',
    '../../../assets/css/icons.css',
    './links.component.scss'],
  host: {'class': 'linktree black'},  
})

export class LinksComponent {
  public links = [
    { type: "spotify", 
      icon: "icon-spotify",
      text: "links.spotify", 
      button: "primary",
      link: "spotify:album:0quqDx9Qf79Gt8GC4sZQn5" 
    },
    { type: "appleMusic", 
      icon: "icon-apple-music",
      text: "links.appleMusic", 
      button: "primary",
      link: "https://music.apple.com/es/album/el-camino-correcto-single/1681612169?ls=1" 
    },
    { type: "youtubeMusic", 
      icon: "icon-youtube-music",
      text: "links.youtubeMusic", 
      button: "primary",
      link: "https://music.youtube.com/playlist?list=OLAK5uy_nyRpPwsfhWIu5s23cXyI84gOU6zuvpi-U" 
    }, 
    { type: "youtube", 
      icon: "icon-youtube",
      text: "links.youtube", 
      button: "secondary",
      link: "https://www.youtube.com/watch?v=5HU8pUNCpMs" 
    }, 
    { type: "pulpop",       
      text: "links.pulpop", 
      button: "secondary",
      link: "http://www.pulpop.es/concurso/semifinalistas/sweet_q" 
    }
  ];

  public primaryLinks = this.links.filter(link => link.button === "primary");
  public secondaryLinks = this.links.filter(link => link.button === "secondary");

};