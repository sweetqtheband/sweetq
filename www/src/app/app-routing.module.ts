import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LinksComponent } from '@views/links/links.component';

const routes: Routes = [
  { path: '', loadChildren:  () => import('@views/home/home.module').then(m => m.HomeViewModule) },
  { path: 'callback', loadChildren:  () => import('@views/callback/callback.module').then(m => m.CallbackViewModule) },
  { path: 'links', component: LinksComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
