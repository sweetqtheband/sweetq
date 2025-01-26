import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('@views/home/home.module').then((m) => m.HomeViewModule),
  },
  {
    path: 'callback',
    loadChildren: () =>
      import('@views/callback/callback.module').then(
        (m) => m.CallbackViewModule
      ),
  },
  {
    path: 'links',
    loadChildren: () =>
      import('@views/links/links.module').then((m) => m.LinksViewModule),
  },
  {
    path: 'listen',
    loadChildren: () =>
      import('@views/listen/listen.module').then((m) => m.ListenViewModule),
  },
  {
    path: 'track',
    loadChildren: () =>
      import('@views/track/track.module').then((m) => m.TrackViewModule),
  },
  {
    path: 'album',
    loadChildren: () =>
      import('@views/album/album.module').then((m) => m.AlbumViewModule),
  },
  {
    path: '404',
    loadChildren: () =>
      import('@views/not-found/not-found.module').then(
        (m) => m.NotFoundViewModule
      ),
  },
  { path: '**', redirectTo: '/404' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
