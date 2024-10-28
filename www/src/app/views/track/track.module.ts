import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { TrackRoutingModule } from './track.routes';
import { StreamService } from '@services/stream.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PlayerModule } from '@modules/player.module';
import { SweetQAlbumModule } from '@modules/sweetq/album.module';
import { TrackComponent } from './track.component';
import { DateService } from '@services/date.service';
import { SystemService } from '@services/system.service';
import { TogglerModule } from '@modules/toggler.module';
import { HomeViewModule } from '@views/home/home.module';
import { SweetQTrackDownloadModule } from '@modules/sweetq/track-download.module';


// configures NgModule imports and exports
@NgModule({
  imports: [
    TrackRoutingModule,
    CommonModule,
    TranslateModule,
    PlayerModule,
    SweetQAlbumModule,    
    TogglerModule,
    HomeViewModule,
    SweetQTrackDownloadModule
  ],
  declarations: [TrackComponent],
  providers: [StreamService, SystemService, DateService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TrackViewModule {}