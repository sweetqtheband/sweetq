import { NgModule } from '@angular/core';
import { ListenRoutingModule } from './listen.routes';
import { StreamService } from '@services/stream.service';
import { CommonModule } from '@angular/common';
import { ListenComponent } from './listen.component';
import { PlayerComponent } from '@components/player.component';
import { TranslateModule } from '@ngx-translate/core';

// configures NgModule imports and exports
@NgModule({
  imports: [ListenRoutingModule, CommonModule, TranslateModule],
  declarations: [ListenComponent, PlayerComponent],
  providers: [StreamService]
})
export class ListenViewModule { }