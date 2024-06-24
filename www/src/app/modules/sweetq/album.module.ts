import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SweetQAlbumComponent } from '@components/sweetq/album.component';
import { DateService } from '@services/date.service';

@NgModule({
  imports: [CommonModule],
  declarations: [SweetQAlbumComponent],
  providers: [DateService],
  exports: [SweetQAlbumComponent],
})
export class SweetQAlbumModule {}
