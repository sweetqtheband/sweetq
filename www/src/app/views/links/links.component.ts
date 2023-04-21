import {    
  Component
} from '@angular/core';

@Component({
  selector: 'links-view',
  templateUrl: './links.component.html',  
})

export class LinksComponent {
  public presaveLinks = [
    { type: "spotify", text: "presave.spotify", link: "spotify:album:0quqDx9Qf79Gt8GC4sZQn5" },
    { type: "appleMusic", text: "presave.appleMusic", link: "https://music.apple.com/us/album/el-camino-correcto-single/1681612169?ls=1" },
    { type: "deezer", text: "presave.deezer", link: "https://www.deezer.com/album/428017317" }
  ];
};