import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SweetQAlbumsComponent } from '@components/sweetq/albums.component';
import { DateService } from '@services/date.service';

@NgModule({
  imports: [CommonModule],
  declarations: [SweetQAlbumsComponent],
  providers: [DateService],
  exports: [SweetQAlbumsComponent],
})
export class SweetQAlbumsModule {}
