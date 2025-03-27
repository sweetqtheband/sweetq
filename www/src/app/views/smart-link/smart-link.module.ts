import { CommonModule } from '@angular/common';
import { SmartLinkRoutingModule } from './smart-link.routes';
import { TranslateModule } from '@ngx-translate/core';
import { SafePipeModule } from '@components/pipes/safe.module';
import { NgModule } from '@angular/core';
import { SmartLinkComponent } from './smart-link.component';
import { StreamService } from '@services/stream.service';
import { SweetQAlbumModule } from '@modules/sweetq/album.module';

// configures NgModule imports and exports
@NgModule({
  imports: [
    SmartLinkRoutingModule,
    TranslateModule,
    CommonModule,
    SafePipeModule,
    SweetQAlbumModule,
  ],
  declarations: [SmartLinkComponent],

  providers: [StreamService],
})
export class SmartLinkViewModule {}
