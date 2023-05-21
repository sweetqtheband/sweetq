import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren:  () => import('@views/home/home.module').then(m => m.HomeViewModule) },
  { path: 'callback', loadChildren:  () => import('@views/callback/callback.module').then(m => m.CallbackViewModule) },
  { path: 'links', loadChildren:  () => import('@views/links/links.module').then(m => m.LinksViewModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
