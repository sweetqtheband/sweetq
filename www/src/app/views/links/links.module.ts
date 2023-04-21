import { NgModule, CommonModule } from "@angular/common";
import { LinksRoutingModule } from "./links.routes";
import { TranslateModule } from '@ngx-translate/core';
import { SafePipeModule } from '@components/pipes/safe.module';

// configures NgModule imports and exports
@NgModule({
    imports: [ LinksRoutingModule, TranslateModule, CommonModule, SafePipeModule],
    exports: [],
    bootstrap: [],
    declarations: [],
    providers: []
})

export class LinksViewModule { }