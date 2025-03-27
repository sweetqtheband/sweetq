import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SmartLinkComponent } from './smart-link.component';

const routes: Routes = [{ path: '', component: SmartLinkComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SmartLinkRoutingModule {}
