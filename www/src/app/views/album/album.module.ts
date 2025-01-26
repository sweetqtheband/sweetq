import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { TrackRoutingModule } from './album.routes';
import { StreamService } from '@services/stream.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PlayerModule } from '@modules/player.module';
import { SweetQAlbumModule } from '@modules/sweetq/album.module';
import { AlbumComponent } from './album.component';
import { DateService } from '@services/date.service';
import { SystemService } from '@services/system.service';
import { TogglerModule } from '@modules/toggler.module';
import { HomeViewModule } from '@views/home/home.module';
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
  ],
  declarations: [AlbumComponent],
  providers: [StreamService, SystemService, DateService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AlbumViewModule {}
