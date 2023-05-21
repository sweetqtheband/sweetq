import {    
    Component,
    Input,
    Output,
    EventEmitter
} from '@angular/core';



@Component({
    selector: 'sweetq-videos',
    templateUrl: './videos.component.html',  
})

export class SweetQVideosComponent {                 
    @Input() halfVideos: boolean = false;
    @Output() showVideoEvent = new EventEmitter<any>();

    public showVideo:boolean = false;
    public videoUrl:string = '';  
    public videos:any = { 
      caminocorrecto: "https://www.youtube.com/embed/5HU8pUNCpMs",
      nuevaera: "https://www.youtube.com/embed/YswuyL8c6ZA",
      mal: "https://www.youtube.com/embed/oiZOK9MxPNA",
      cosasclaras: "https://www.youtube.com/embed/1paz9-hyg30"
    }             
  
    showModal(value:any, video:string):void {    
      if (video)
      {
        this.videoUrl = this.videos[video] + "?rel=0&autoplay=1";    
        this.showVideo = value ? value : this.showVideo === false;        
        this.showVideoEvent.emit({showVideo: this.showVideo, videoUrl: this.videoUrl});
      }
    }         
}