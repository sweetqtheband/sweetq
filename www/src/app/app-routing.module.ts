import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LinksComponent } from '@views/links/links.component';

const routes: Routes = [
  { path: '', loadChildren:  () => import('@views/home/home.module').then(m => m.HomeViewModule) },
  { path: 'links', component: LinksComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
