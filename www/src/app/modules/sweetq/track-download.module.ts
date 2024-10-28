
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StreamService } from '@services/stream.service';
import { SweetQTrackDownloadComponent } from '@components/sweetq/track-download.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [CommonModule, TranslateModule],
  declarations: [SweetQTrackDownloadComponent],
  providers: [StreamService],
  exports: [SweetQTrackDownloadComponent],
})
export class SweetQTrackDownloadModule {}
