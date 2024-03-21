import { CommonModule } from "@angular/common";
import { LinksRoutingModule } from "./links.routes";
import { TranslateModule } from '@ngx-translate/core';
import { SafePipeModule } from '@components/pipes/safe.module';
import { NgModule } from "@angular/core";
import { LinksComponent } from "./links.component";
import { LinksService } from "@services/links.service";

// configures NgModule imports and exports
@NgModule({
    imports: [
        LinksRoutingModule, TranslateModule, CommonModule, SafePipeModule],
    exports: [],
    bootstrap: [],
    declarations: [LinksComponent],
    providers: [LinksService]
})

export class LinksViewModule { }