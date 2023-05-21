import { Component, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Angulartics2GoogleAnalytics } from 'angulartics2';
import * as moment from 'moment';

@Component({
  selector: 'body',
  templateUrl: './app.component.html',
  styleUrls: ['../assets/css/reset.css',
              '../assets/css/fonts.css',
              '../assets/css/icons.css',
              '../assets/css/style.css'],
  encapsulation: ViewEncapsulation.None
})

export class AppComponent {
  constructor(angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics, 
    translate: TranslateService) {

    translate.setDefaultLang('en');
    let language = String(navigator.language).split("-");

    translate.use(language[0]);
    moment.locale(language[0]);
    
    angulartics2GoogleAnalytics.startTracking();
  }  
}
