import { NgModule, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterModule,
  RouterStateSnapshot,
  Routes,
} from '@angular/router';
import { AlbumComponent } from './album.component';
import { CanActivateListen } from './album.guard';
import { EncryptionService } from '@services/encryption.service';

const routes: Routes = [
  {
    path: '',
    component: AlbumComponent,
    canActivate: [
      (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
        inject(CanActivateListen).canActivate(route, state),
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [CanActivateListen, EncryptionService],
})
export class TrackRoutingModule {}
