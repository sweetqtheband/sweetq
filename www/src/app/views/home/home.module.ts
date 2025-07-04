import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '@components/modal.component';
import { SpotifyComponent } from '@components/spotify.component';
import { SafePipeModule } from '@components/pipes/safe.module';
import { GigsService } from '@services/gigs.service';
import { BandsService } from '@services/bands.service';
import { VideosService } from '@services/videos.service';
import { SwipeService } from '@services/swipe.service';
import { SweetQHeaderComponent } from '@components/sweetq/header.component';
import { SweetQGigsComponent } from '@components/sweetq/gigs.component';
import { SweetQInfoComponent } from '@components/sweetq/info.component';
import { SweetQVideosComponent } from '@components/sweetq/videos.component';
import { SweetQKitComponent } from '@components/sweetq/kit.component';
import { SweetQFooterComponent } from '@components/sweetq/footer.component';
import { PresaveComponent } from '@components/presave.component';
import { MapComponent } from '@components/map.component';
import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home.routes';
import { SpotifyService } from '@services/spotify.service';
import { NewsService } from '@services/news.service';
import { SweetQGigComponent } from '@components/sweetq/gig.component';
import { SystemService } from '@services/system.service';

// configures NgModule imports and exports
@NgModule({
  imports: [HomeRoutingModule, TranslateModule, CommonModule, SafePipeModule],
  bootstrap: [],
  declarations: [
    HomeComponent,
    SweetQHeaderComponent,
    SweetQGigsComponent,
    SweetQGigComponent,
    SweetQVideosComponent,
    SweetQInfoComponent,
    SweetQKitComponent,
    SweetQFooterComponent,
    PresaveComponent,
    MapComponent,
    ModalComponent,
    SpotifyComponent,
  ],
  exports: [
    SweetQHeaderComponent,
    SweetQGigsComponent,
    SweetQGigComponent,
    SweetQVideosComponent,
    SweetQInfoComponent,
    SweetQKitComponent,
    SweetQFooterComponent,
    MapComponent,
    ModalComponent,
    SpotifyComponent,
  ],
  providers: [
    GigsService,
    BandsService,
    VideosService,
    SwipeService,
    SpotifyService,
    NewsService,
    SystemService,
  ],
})
export class HomeViewModule {}
