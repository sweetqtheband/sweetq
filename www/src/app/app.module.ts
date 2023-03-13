import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {HttpClientModule, HttpClient} from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import { AppComponent } from './app.component';
import { ModalComponent } from './modal.component';
import { SpotifyComponent } from './spotify.component';
import { GigsService } from './gigs.service';
import { BandsService } from './bands.service';
import { SwipeService } from './swipe.service';
import { Angulartics2Module, Angulartics2GoogleAnalytics } from 'angulartics2';


import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Pipe({ name: 'safe' })
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
} 


const ROUTES: Routes = [
  { path: '', component: AppComponent },
];

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, '/assets/i18n/', '.json?cb=' + new Date().getTime());
}


@NgModule({  
  imports: [
    BrowserModule,   
    HttpClientModule,    
    RouterModule.forRoot(ROUTES),    
    TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
      }
    }),
    Angulartics2Module.forRoot([ Angulartics2GoogleAnalytics ])    
  ],
  declarations: [AppComponent, ModalComponent, SpotifyComponent, SafePipe],
  bootstrap: [AppComponent],
  providers: [GigsService, BandsService, SwipeService]
})
export class AppModule { }
