import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { ListenRoutingModule } from './listen.routes';
import { StreamService } from '@services/stream.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PlayerModule } from '@modules/player.module';
import { SweetQAlbumsModule } from '@modules/sweetq/albums.module';
import { ListenComponent } from './listen.component';
import { DateService } from '@services/date.service';
import { SystemService } from '@services/system.service';


// configures NgModule imports and exports
@NgModule({
  imports: [
    ListenRoutingModule,
    CommonModule,
    TranslateModule,
    PlayerModule,
    SweetQAlbumsModule
  ],
  declarations: [ListenComponent],
  providers: [StreamService, SystemService, DateService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ListenViewModule {}