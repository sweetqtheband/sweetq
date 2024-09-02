import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TogglerComponent, TogglerItemComponent } from '@components/toggler.component';

@NgModule({
  imports: [CommonModule],
  declarations: [TogglerComponent, TogglerItemComponent],
  exports: [TogglerComponent, TogglerItemComponent],
})
export class TogglerModule {}
