import { CommonModule } from "@angular/common";
import { CallbackRoutingModule } from "./callback.routes";
import { TranslateModule } from '@ngx-translate/core';
import { SafePipeModule } from '@components/pipes/safe.module';
import { NgModule } from "@angular/core";
import { SpotifyService } from "@services/spotify.service";

// configures NgModule imports and exports
@NgModule({
    imports: [ CallbackRoutingModule, TranslateModule, CommonModule, SafePipeModule],
    exports: [],
    bootstrap: [],
    declarations: [],
    providers: [SpotifyService]
})

export class CallbackViewModule { }