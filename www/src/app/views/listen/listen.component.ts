import { OnInit, Component, HostBinding } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { StreamService } from '@services/stream.service';
import { Media } from "@interfaces/media";
import { Nullable } from 'src/app/types';
import config from 'src/app/config';
import { Data } from '@interfaces/data';


@Component({
  selector: 'listen-view',
  templateUrl: './listen.component.html',
  styleUrls: [
    '../../../assets/css/fonts.css',
    '../../../assets/css/icons.css',
    './listen.component.scss'],
})


export class ListenComponent implements OnInit {
  @HostBinding('class.sq-view') sqView: boolean = true;
  public items: Media[] = [];
  public tid: Nullable<string> = null;
  public data: Data = { listeners: '-', plays: '-' };
  get headers(): any {
    return { TID: this.tid }
  }

  constructor(private meta: Meta, private http: StreamService, private route: ActivatedRoute) {
    this.meta.removeTag('name="keywords"');
    this.meta.removeTag('name="description"');
    this.meta.updateTag({ name: 'robots', content: 'noindex' });
  }

  async ngOnInit(): Promise<any> {
    this.tid = this.route.snapshot.queryParams['tId'];
    this.data = await this.http.getData({
      params: {
        artistId: config.listen.artistId,
        trackId: config.listen.trackId
      },
      headers: this.headers
    });

    this.items = await this.http.getMedia({ headers: this.headers });
  }
}