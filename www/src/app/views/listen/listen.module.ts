import { NgModule } from '@angular/core';
import { ListenRoutingModule } from './listen.routes';
import { StreamService } from '@services/stream.service';
import { CommonModule } from '@angular/common';
import { ListenComponent } from './listen.component';
import { PlayerModule } from '@modules/player.module';
import { TranslateModule } from '@ngx-translate/core';

// configures NgModule imports and exports
@NgModule({
  imports: [
    ListenRoutingModule,
    CommonModule,
    TranslateModule,
    PlayerModule
  ],
  declarations: [ListenComponent],
  providers: [StreamService],
})
export class ListenViewModule {}