import { CommonModule } from "@angular/common";
import { NewsRoutingModule } from "./news.routes";
import { TranslateModule } from '@ngx-translate/core';
import { SafePipeModule } from '@components/pipes/safe.module';
import { NgModule } from "@angular/core";

// configures NgModule imports and exports
@NgModule({
  imports: [ NewsRoutingModule, TranslateModule, CommonModule, SafePipeModule],
  exports: [],
  bootstrap: [],
  declarations: [],
  providers: []
})
export class NewsViewModule { }