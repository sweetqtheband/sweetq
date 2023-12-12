import { Component, OnDestroy, OnInit } from '@angular/core';
import { News } from '@interfaces/news';
import { NewsService } from '@services/news.service';

@Component({
  selector: 'home-view',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit, OnDestroy {
  windowResizeHandler;

  public halfVideos = true;
  public playAlbum = false;
  public showVideo = false;
  public showMap = false;
  public news: News[] = [];
  public videoUrl = '';
  public mapUrl = '';
  public gigHref = 'https://www.youtube.com/watch?v=YMRrlu4uK2Q';
  public presaveHref =
    'https://accounts.spotify.com/authorize?client_id=52bb6de395384e7bb580f44922501752&redirect_uri=https%3A%2F%2Fampl.ink%2Fpresave%2Fcallback%2Fspotify&scope=user-follow-modify+user-library-modify&response_type=code&state=MMe2M';

  constructor(private newsSvc: NewsService) {
    this.windowResizeHandler = () => {
      this.setWidths();
    };

    this.setData();
  }

  setWidths() {
    if (window.innerWidth < 600) {
      this.halfVideos = false;
    } else {
      this.halfVideos = true;
    }
  }

  showChange(value: boolean) {
    this.showVideo = value;
  }

  async setData() {
    this.news = await this.newsSvc.getNews();
  }
  ngOnInit() {
    this.setWidths();
    window.addEventListener('resize', this.windowResizeHandler);
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.windowResizeHandler);
  }
}
