webpackJsonp(["main"],{

/***/ "../../../../../src/$$_gendir lazy recursive":
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncatched exception popping up in devtools
	return Promise.resolve().then(function() {
		throw new Error("Cannot find module '" + req + "'.");
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = "../../../../../src/$$_gendir lazy recursive";

/***/ }),

/***/ "../../../../../src/app/app.component.html":
/***/ (function(module, exports) {

module.exports = "<script>\n    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){\n    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),\n    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)\n    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');\n  \n    ga('create', 'UA-106947816-1', 'auto');      \n</script>\n<div class=\"sq-bg\">\n    <div class=\"sq-wrapper\">\n        <h1 class=\"sq-logo\">\n            <div class=\"sq-logo-image\">\n                <span class=\"visuallyhidden\">Sweet Q</span>\n            </div>\n        </h1>\n        <div class=\"sq-ep sq-hero\" *ngIf=\"release\">             \n            \n        </div>\n        <div class=\"sq-ep sq-hero\" *ngIf=\"!release\">\n            <h2 class=\"sq-headline\">{{ 'releaseMessage' | translate }}</h2>\n        </div>                \n        <div class=\"sq-platforms\">\n            <div target=\"_blank\" class=\"sq-button sq-spotify\" (click)=\"showSpotifyModal()\"  (showChange)=\"showSpotifyModal($event)\">\n                <span class=\"sq-icon icon-spotify\"></span>\n                <span class=\"sq-button-text\" *ngIf=\"release\">{{ 'listenInSpotify' | translate }}</span>\n            </div>                        \n            <div class=\"sq-platforms-icons\">\n                <a class=\"sq-button {{release ? '' : 'disabled'}}\" title=\"Spotify\" *ngIf=\"!release\">\n                    <span class=\"sq-icon icon-spotify\"></span>\n                </a>\n                <a [target]=\"target\" [href]=\"links.amazon\" class=\"sq-button sq-amazon {{release ? '' : 'disabled'}}\" title=\"Amazon\">\n                    <span class=\"sq-icon icon-amazon\"></span>\n                </a>\n                <a [target]=\"target\" [href]=\"links.appleMusic\" class=\"sq-button sq-apple-music {{release ? '' : 'disabled'}}\" title=\"Apple Music\">\n                    <span class=\"sq-icon icon-apple-music\"></span>\n                </a>\n                <a [target]=\"target\" [href]=\"links.googlePlay\" class=\"sq-button sq-google-play {{release ? '' : 'disabled'}}\" title=\"Google Play\">\n                    <span class=\"sq-icon icon-google-play\"></span>\n                </a>\n            </div>\n        </div>\n    </div>\n</div>\n\n<div class=\"sq-section gigs\">\n    <div class=\"sq-wrapper\">\n        <div class=\"sq-title-wrapper\">\n            <div class=\"sq-subtitle\">{{ 'nextGigs' | translate }}</div>\n        </div>\n        <div class=\"sq-gigs-list {{halfGigs ? 'half-width' : ''}}\">          \n            <div class=\"sq-text\" *ngIf=\"gigs && !gigs.length\">\n                {{ 'stayTuned' | translate }}\n            </div>  \n            <div class=\"sq-item {{gig.expired ? 'old-gig' : ''}}\" *ngFor=\"let gig of gigs\" >\n                <div class=\"sq-gig-day\">\n                    <span class=\"day\">{{gig.day}}</span>\n                    <span class=\"month\">{{gig.month}}</span>\n                </div>\n                <div class=\"sq-item-data\">\n                    <div class=\"sq-title\">\n                        <div class=\"sq-item-title\">{{gig.venue}}</div>\n                    </div>\n                    <div class=\"sq-gig-info\">\n                        <div class=\"sq-line\">\n                            <div class=\"sq-text sq-city\">\n                                {{gig.city}}\n                            </div>\n                            <div class=\"sq-line-space\" *ngIf=\"gig.hour\">·</div>\n                            <div class=\"sq-text sq-hour\" *ngIf=\"gig.hour\">\n                                {{gig.hour}}\n                            </div>\n                        </div>\n                    </div>\n                    <div class=\"sq-participants\" *ngIf=\"gig.bands.length\">\n                        <div class=\"sq-line\">\n                            <div class=\"sq-text\" *ngFor=\"let band of gig.bands; first as isFirst\">\n                                <div class=\"sq-line-space\" *ngIf=\"!isFirst\">/</div>                            \n                                <a class=\"sq-link\" [href]=\"band.facebook ? band.facebook : '#'\" target=\"_blank\" title=\"{{(band.facebook ? 'goToItsFacebook' : (band.instagram ? 'goToItsInstagram' : null)) | translate}}\" >{{band.name}}</a>\n                            </div>                            \n                        </div>\n                    </div>\n                </div>\n                <div class=\"sq-item-aside\" *ngIf=\"(gig.event || gig.tickets) && !gig.expired\">                \n                    <div class=\"sq-aside-actions\">\n                        <a class=\"sq-button rounded line-blue mini-padding\" target=\"_blank\" [href]=\"gig.tickets\" *ngIf=\"gig.tickets\" title=\"{{'buyTickets'|translate}}\">\n                            <span class=\"sq-icon icon-gigs\"></span>\n                        </a>\n                        <a class=\"sq-button rounded line-blue mini-padding\" target=\"_blank\" [href]=\"gig.event\" *ngIf=\"gig.event\">\n                            <span class=\"sq-button-text\">+ info</span>\n                        </a>\n                    </div>            \n                </div>\n            </div>                   \n        </div>\n    </div>\n</div>\n\n<div class=\"sq-section videos\">\n    <div class=\"sq-title-wrapper\">\n        <div class=\"sq-subtitle\">Vídeos</div>\n    </div>\n    <div class=\"sq-videos-list {{halfVideos ? 'flex-width' : ''}}\">\n        <div class=\"sq-item\">\n            <div class=\"sq-video cosasclaras\"  (click)=\"showModal(null, 'cosasclaras')\"  (showChange)=\"showModal($event, 'cosasclaras')\">\n                <div class=\"sq-frame\">\n                    <div class=\"sq-play-wrapper\">\n                        <div class=\"sq-button sq-play\">\n                            <span class=\"sq-icon icon-play\"></span>\n                        </div>\n                    </div>\n                </div>\n                <div class=\"sq-video-title\">\n                    <div class=\"sq-video-title-text\">{{ 'videoLabel.cosasclaras' | translate }}</div>\n                </div>\n            </div>\n        </div>\n        <div class=\"sq-item\">\n            <div class=\"sq-video nuevaera\"  (click)=\"showModal(null, 'nuevaera')\"  (showChange)=\"showModal($event, 'nuevaera')\">\n                <div class=\"sq-frame\">\n                    <div class=\"sq-play-wrapper\">\n                        <div class=\"sq-button sq-play\">\n                            <span class=\"sq-icon icon-play\"></span>\n                        </div>\n                    </div>\n                </div>\n                <div class=\"sq-video-title\">\n                    <div class=\"sq-video-title-text\">{{ 'videoLabel.nuevaera' | translate }}</div>\n                </div>\n            </div>\n        </div>\n        <div class=\"sq-item\">\n            <div class=\"sq-video mal\"  (click)=\"showModal(null, 'mal')\"  (showChange)=\"showModal($event, 'mal')\">\n                <div class=\"sq-frame\">\n                    <div class=\"sq-play-wrapper\">\n                        <div class=\"sq-button sq-play\">\n                            <span class=\"sq-icon icon-play\"></span>\n                        </div>\n                    </div>\n                </div>\n                <div class=\"sq-video-title\">\n                    <div class=\"sq-video-title-text\">{{ 'videoLabel.mal' | translate }}</div>\n                </div>\n            </div> \n        </div>\n    </div>\n</div>\n\n<div class=\"sq-section notice concierto\" *ngIf=\"gigHref\">\n    <div class=\"sq-wrapper\">\n        <div class=\"sq-half-columns\">\n            <div class=\"sq-column column-left\">\n                <div class=\"sq-image-wrapper square\">\n                    <div class=\"sq-image image-cover\"></div>\n                </div>\n            </div>\n            <div class=\"sq-column column-right\">\n                <div class=\"sq-title-wrapper\">\n                    <div class=\"sq-title\"> {{'gig.date' | translate}}</div>\n                    <div class=\"sq-subtitle\">{{ 'gig.title' | translate}}</div>\n                </div>\n                <div class=\"sq-text\" [innerHTML]=\"'gig.text'| translate\"></div>\n                <div class=\"sq-actions\">\n                    <a target=\"_blank\" [href]=\"gigHref\" class=\"sq-button rounded solid-blue\">\n                        <div class=\"sq-button-text\">{{ 'gig.watchEvent' | translate}}</div>\n                    </a>\n                </div>\n            </div>\n        </div>\n    </div>\n</div>\n\n<div class=\"sq-section notice info\">\n    <div class=\"sq-wrapper\">\n        <div class=\"sq-half-columns\">\n            <div class=\"sq-column column-left\">\n                <div class=\"sq-image-wrapper square\">\n                    <div class=\"sq-image image-cover\">                        \n                    </div>\n                </div>\n            </div>\n            <div class=\"sq-column column-right\">\n                <div class=\"sq-title-wrapper\">\n                    <div class=\"sq-title\"> {{'info.title' | translate}}</div>                    \n                    <div class=\"sq-subtitle\"> {{'info.subtitle' | translate}}</div>                    \n                </div>\n                <div class=\"sq-text\" [innerHTML]=\"'info.text'| translate\"></div>\n                <!--\n                <div class=\"sq-actions\" *ngIf=\"true === false\">\n                    <a target=\"_blank\" [href]=\"managementHref\" class=\"sq-button rounded solid-blue\">\n                        <div class=\"sq-button-text\">{{ 'management.readMore' | translate}}</div>\n                    </a>\n                </div>\n            -->\n            </div>\n        </div>\n    </div>\n</div>\n\n<div class=\"sq-section kit\">\n    <div class=\"sq-wrapper\">\n        <div class=\"sq-half-columns\">\n            <div class=\"sq-column column-right\">\n                <div class=\"sq-title-wrapper\">\n                    <div class=\"sq-subtitle\">{{ 'pressKit.title' | translate }}</div>\n                </div>\n                <div class=\"sq-text\" [innerHTML]=\"'pressKit.text'|translate\"></div>\n                <div class=\"sq-actions\">\n                    <a class=\"sq-button rounded solid-blue\" title=\"{{ 'pressKit.download'|translate}}\" target=\"_self\" href=\"assets/press-kits/2023-sweetq-epk.zip\">\n                        <div class=\"sq-button-text\" [innerHTML]=\"'pressKit.button'|translate\"></div>\n                    </a>\n                </div>\n            </div>\n        </div>\n    </div>\n</div>\n\n<div class=\"sq-contact\">\n    <div class=\"sq-contact-icons\">        \n        <a target=\"_blank\" class=\"sq-button sq-facebook\" title=\"Facebook\" href=\"https://www.facebook.com/sweetqtheband\">\n            <span class=\"sq-icon icon-facebook\"></span>\n        </a>\n        <a target=\"_blank\" class=\"sq-button sq-twitter\" title=\"Twitter\" href=\"https://www.twitter.com/sweetqtheband\">\n            <span class=\"sq-icon icon-twitter\"></span>\n        </a>\n        <a target=\"_blank\" class=\"sq-button sq-instagram\" title=\"Instagram\" href=\"https://www.instagram.com/sweetqtheband\">\n            <span class=\"sq-icon icon-instagram\"></span>\n        </a>\n        <a target=\"_blank\" class=\"sq-button sq-youtube\" title=\"Youtube\" href=\"https://www.youtube.com/sweetqtheband\">\n            <span class=\"sq-icon icon-youtube\"></span>\n        </a>        \n        <a class=\"sq-button sq-mail\" title=\"Email\" href=\"mailto:hola@sweetq.es\">\n            <span class=\"sq-icon icon-mail\"></span>\n        </a>\n    </div>\n</div>\n\n<modal [(show)]=\"showVideo\" [(url)]=\"videoUrl\"></modal>\n\n<spotify [(show)]=\"playAlbum\"></spotify>\n"

/***/ }),

/***/ "../../../../../src/app/app.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ngx_translate_core__ = __webpack_require__("../../../../@ngx-translate/core/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_angulartics2__ = __webpack_require__("../../../../angulartics2/dist/es5/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_angulartics2___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_angulartics2__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__gigs_service__ = __webpack_require__("../../../../../src/app/gigs.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_moment__ = __webpack_require__("../../../../moment/moment.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_moment___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_moment__);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};





var AppComponent = (function () {
    function AppComponent(angulartics2GoogleAnalytics, translate, gigsSvc) {
        var _this = this;
        this.gigsSvc = gigsSvc;
        this.halfGigs = true;
        this.halfVideos = true;
        this.release = true;
        this.showVideo = false;
        this.playAlbum = false;
        this.gigHref = null;
        this.videoUrl = null;
        this.videos = { nuevaera: "https://www.youtube.com/embed/YswuyL8c6ZA",
            mal: "https://www.youtube.com/embed/oiZOK9MxPNA",
            cosasclaras: "https://www.youtube.com/embed/1paz9-hyg30"
        };
        this.links = { spotify: "https://open.spotify.com/album/2sLEzbmAKph9t2qIVWyiFh",
            amazon: "https://www.amazon.es/Nueva-Era-Sweet-Q/dp/B075G6WQYW",
            appleMusic: "https://itunes.apple.com/us/album/la-nueva-era-ep/id1280668188",
            googlePlay: "https://play.google.com/store/music/album/Sweet_Q_La_Nueva_Era?id=Bcyjv2sp5jvkk3td7mxdkyogdom"
        };
        this.target = '_blank';
        translate.setDefaultLang('en');
        var language = String(navigator.language).split("-");
        translate.use(language[0]);
        __WEBPACK_IMPORTED_MODULE_4_moment__["locale"](language[0]);
        this.windowResizeHandler = function (e) {
            _this.setWidths();
        };
    }
    AppComponent.prototype.showModal = function (value, video) {
        this.videoUrl = this.videos[video] + "?rel=0&autoplay=1";
        this.showVideo = value ? value : (this.showVideo == false ? true : false);
    };
    AppComponent.prototype.showSpotifyModal = function (value) {
        this.playAlbum = value ? value : (this.playAlbum == false ? true : false);
    };
    AppComponent.prototype.getGigs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.gigsSvc.getGigs().then(function (gigs) {
                    _this.gigs = gigs.filter(function (gig) { return !gig.expired; });
                });
                return [2 /*return*/];
            });
        });
    };
    AppComponent.prototype.setWidths = function () {
        if (window.innerWidth <= 906) {
            this.halfGigs = false;
        }
        else {
            this.halfGigs = true;
        }
        if (window.innerWidth < 600) {
            this.halfVideos = false;
        }
        else {
            this.halfVideos = true;
        }
    };
    AppComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.setWidths();
        if (!this.release) {
            Object.keys(this.links).map(function (key) {
                _this.links[key] = "#";
                _this.target = "_self";
            });
        }
        this.getGigs();
        window.addEventListener('resize', this.windowResizeHandler);
    };
    AppComponent.prototype.ngOnDestroy = function () {
        window.removeEventListener('resize', this.windowResizeHandler);
    };
    return AppComponent;
}());
AppComponent = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
        selector: 'body',
        template: __webpack_require__("../../../../../src/app/app.component.html"),
        styles: [__webpack_require__("../../../../../src/assets/css/reset.css"), __webpack_require__("../../../../../src/assets/css/style.css")],
        encapsulation: __WEBPACK_IMPORTED_MODULE_0__angular_core__["ViewEncapsulation"].None
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_2_angulartics2__["Angulartics2GoogleAnalytics"] !== "undefined" && __WEBPACK_IMPORTED_MODULE_2_angulartics2__["Angulartics2GoogleAnalytics"]) === "function" && _a || Object, typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_1__ngx_translate_core__["c" /* TranslateService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__ngx_translate_core__["c" /* TranslateService */]) === "function" && _b || Object, typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_3__gigs_service__["a" /* GigsService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_3__gigs_service__["a" /* GigsService */]) === "function" && _c || Object])
], AppComponent);

var _a, _b, _c;
//# sourceMappingURL=app.component.js.map

/***/ }),

/***/ "../../../../../src/app/app.module.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export SafePipe */
/* unused harmony export HttpLoaderFactory */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser__ = __webpack_require__("../../../platform-browser/@angular/platform-browser.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_common_http__ = __webpack_require__("../../../common/@angular/common/http.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_router__ = __webpack_require__("../../../router/@angular/router.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__ngx_translate_core__ = __webpack_require__("../../../../@ngx-translate/core/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ngx_translate_http_loader__ = __webpack_require__("../../../../@ngx-translate/http-loader/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__app_component__ = __webpack_require__("../../../../../src/app/app.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__modal_component__ = __webpack_require__("../../../../../src/app/modal.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__spotify_component__ = __webpack_require__("../../../../../src/app/spotify.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__gigs_service__ = __webpack_require__("../../../../../src/app/gigs.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__bands_service__ = __webpack_require__("../../../../../src/app/bands.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__swipe_service__ = __webpack_require__("../../../../../src/app/swipe.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12_angulartics2__ = __webpack_require__("../../../../angulartics2/dist/es5/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12_angulartics2___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_12_angulartics2__);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};














var SafePipe = (function () {
    function SafePipe(sanitizer) {
        this.sanitizer = sanitizer;
    }
    SafePipe.prototype.transform = function (url) {
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    };
    return SafePipe;
}());
SafePipe = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Pipe"])({ name: 'safe' }),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser__["DomSanitizer"] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser__["DomSanitizer"]) === "function" && _a || Object])
], SafePipe);

var ROUTES = [
    { path: '', component: __WEBPACK_IMPORTED_MODULE_6__app_component__["a" /* AppComponent */] },
];
// AoT requires an exported function for factories
function HttpLoaderFactory(http) {
    return new __WEBPACK_IMPORTED_MODULE_5__ngx_translate_http_loader__["a" /* TranslateHttpLoader */](http, '/assets/i18n/', '.json?cb=' + new Date().getTime());
}
var AppModule = (function () {
    function AppModule() {
    }
    return AppModule;
}());
AppModule = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["NgModule"])({
        imports: [
            __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser__["BrowserModule"],
            __WEBPACK_IMPORTED_MODULE_2__angular_common_http__["b" /* HttpClientModule */],
            __WEBPACK_IMPORTED_MODULE_3__angular_router__["RouterModule"].forRoot(ROUTES),
            __WEBPACK_IMPORTED_MODULE_4__ngx_translate_core__["b" /* TranslateModule */].forRoot({
                loader: {
                    provide: __WEBPACK_IMPORTED_MODULE_4__ngx_translate_core__["a" /* TranslateLoader */],
                    useFactory: HttpLoaderFactory,
                    deps: [__WEBPACK_IMPORTED_MODULE_2__angular_common_http__["a" /* HttpClient */]]
                }
            }),
            __WEBPACK_IMPORTED_MODULE_12_angulartics2__["Angulartics2Module"].forRoot([__WEBPACK_IMPORTED_MODULE_12_angulartics2__["Angulartics2GoogleAnalytics"]])
        ],
        declarations: [__WEBPACK_IMPORTED_MODULE_6__app_component__["a" /* AppComponent */], __WEBPACK_IMPORTED_MODULE_7__modal_component__["a" /* ModalComponent */], __WEBPACK_IMPORTED_MODULE_8__spotify_component__["a" /* SpotifyComponent */], SafePipe],
        bootstrap: [__WEBPACK_IMPORTED_MODULE_6__app_component__["a" /* AppComponent */]],
        providers: [__WEBPACK_IMPORTED_MODULE_9__gigs_service__["a" /* GigsService */], __WEBPACK_IMPORTED_MODULE_10__bands_service__["a" /* BandsService */], __WEBPACK_IMPORTED_MODULE_11__swipe_service__["a" /* SwipeService */]]
    })
], AppModule);

var _a;
//# sourceMappingURL=app.module.js.map

/***/ }),

/***/ "../../../../../src/app/bands.service.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return BandsService; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_common_http__ = __webpack_require__("../../../common/@angular/common/http.es5.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var BandsService = (function () {
    function BandsService(http) {
        this.http = http;
        this.configUrl = 'assets/json/bands.json';
    }
    BandsService.prototype.getBands = function () {
        return this.http.get(this.configUrl + '?cb=' + new Date().getTime());
    };
    return BandsService;
}());
BandsService = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Injectable"])(),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__angular_common_http__["a" /* HttpClient */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_common_http__["a" /* HttpClient */]) === "function" && _a || Object])
], BandsService);

var _a;
//# sourceMappingURL=bands.service.js.map

/***/ }),

/***/ "../../../../../src/app/gigs.service.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return GigsService; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_common_http__ = __webpack_require__("../../../common/@angular/common/http.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__bands_service__ = __webpack_require__("../../../../../src/app/bands.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_moment__ = __webpack_require__("../../../../moment/moment.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_moment___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_moment__);
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var GigsService = (function () {
    function GigsService(http, bandsSvc) {
        this.http = http;
        this.bandsSvc = bandsSvc;
        this.configUrl = 'assets/json/gigs.json';
    }
    GigsService.prototype.get = function () {
        return this.http.get(this.configUrl + '?cb=' + new Date().getTime());
    };
    GigsService.prototype.getGigs = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.getBands();
            var today = __WEBPACK_IMPORTED_MODULE_3_moment__();
            _this.get().subscribe(function (result) {
                Object.keys(result).map(function (key) {
                    var bands = [];
                    var date = __WEBPACK_IMPORTED_MODULE_3_moment__(result[key].date);
                    if (date.isBefore(today)) {
                        result[key].expired = true;
                    }
                    else {
                        result[key].expired = false;
                    }
                    result[key].day = date.format('DD');
                    result[key].month = date.format('MMM').replace(".", "");
                    result[key].bands.map(function (bandId) {
                        var bandData = _this.bands.find(function (band) { return bandId == band.id; });
                        if (bandData) {
                            bands.push(bandData);
                        }
                    });
                    result[key].bands = bands;
                });
                resolve(result);
            });
        });
    };
    GigsService.prototype.getBands = function () {
        var _this = this;
        this.bandsSvc.getBands().subscribe(function (bands) { return _this.bands = bands; });
    };
    return GigsService;
}());
GigsService = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Injectable"])(),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__angular_common_http__["a" /* HttpClient */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_common_http__["a" /* HttpClient */]) === "function" && _a || Object, typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_2__bands_service__["a" /* BandsService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_2__bands_service__["a" /* BandsService */]) === "function" && _b || Object])
], GigsService);

var _a, _b;
//# sourceMappingURL=gigs.service.js.map

/***/ }),

/***/ "../../../../../src/app/modal.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"sq-modal\" *ngIf=\"show\">\n\n</div>\n<div class=\"sq-modal-preview\" *ngIf=\"show\" (click)=\"hideVideo()\">    \n    <iframe width=\"560\" height=\"315\" [src]=\"url | safe\" frameborder=\"0\" allowfullscreen></iframe>\n</div>"

/***/ }),

/***/ "../../../../../src/app/modal.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ModalComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__swipe_service__ = __webpack_require__("../../../../../src/app/swipe.service.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var ModalComponent = (function () {
    // constructor initializes our declared vars
    function ModalComponent(elementRef, swipeSvc) {
        this.swipeSvc = swipeSvc;
        this.showChange = new __WEBPACK_IMPORTED_MODULE_0__angular_core__["EventEmitter"]();
    }
    ModalComponent.prototype.onShowChanged = function () {
        this.showChange.emit(this.show);
    };
    ModalComponent.prototype.hideVideo = function () {
        this.showChange.emit(false);
    };
    ModalComponent.prototype.ngOnInit = function () {
    };
    ModalComponent.prototype.ngOnDestroy = function () {
    };
    return ModalComponent;
}());
__decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Input"])(),
    __metadata("design:type", Boolean)
], ModalComponent.prototype, "show", void 0);
__decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Input"])(),
    __metadata("design:type", String)
], ModalComponent.prototype, "url", void 0);
__decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Output"])(),
    __metadata("design:type", Object)
], ModalComponent.prototype, "showChange", void 0);
ModalComponent = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
        selector: 'modal',
        template: __webpack_require__("../../../../../src/app/modal.component.html"),
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["ElementRef"] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["ElementRef"]) === "function" && _a || Object, typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_1__swipe_service__["a" /* SwipeService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__swipe_service__["a" /* SwipeService */]) === "function" && _b || Object])
], ModalComponent);

var _a, _b;
//# sourceMappingURL=modal.component.js.map

/***/ }),

/***/ "../../../../../src/app/spotify.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"sq-modal\" *ngIf=\"show\">\n\n</div>\n<div class=\"sq-modal-preview spotify\" *ngIf=\"show\" (click)=\"hideSpotify()\">\n    <iframe width=\"560\" height=\"315\" src=\"https://open.spotify.com/embed?uri=spotify:album:2sLEzbmAKph9t2qIVWyiFh\" frameborder=\"0\" allowfullscreen></iframe>\n</div>"

/***/ }),

/***/ "../../../../../src/app/spotify.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return SpotifyComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/@angular/core.es5.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var SpotifyComponent = (function () {
    // constructor initializes our declared vars
    function SpotifyComponent(elementRef) {
        this.showChange = new __WEBPACK_IMPORTED_MODULE_0__angular_core__["EventEmitter"]();
    }
    SpotifyComponent.prototype.onShowChanged = function () {
        this.showChange.emit(this.show);
    };
    SpotifyComponent.prototype.hideSpotify = function () {
        this.showChange.emit(false);
    };
    SpotifyComponent.prototype.ngOnInit = function () { };
    SpotifyComponent.prototype.ngOnDestroy = function () { };
    return SpotifyComponent;
}());
__decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Input"])(),
    __metadata("design:type", Boolean)
], SpotifyComponent.prototype, "show", void 0);
__decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Output"])(),
    __metadata("design:type", Object)
], SpotifyComponent.prototype, "showChange", void 0);
SpotifyComponent = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
        selector: 'spotify',
        template: __webpack_require__("../../../../../src/app/spotify.component.html"),
    }),
    __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["ElementRef"] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["ElementRef"]) === "function" && _a || Object])
], SpotifyComponent);

var _a;
//# sourceMappingURL=spotify.component.js.map

/***/ }),

/***/ "../../../../../src/app/swipe.service.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return SwipeService; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/@angular/core.es5.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var SwipeService = (function () {
    function SwipeService() {
        var _this = this;
        this.xDown = null;
        this.yDown = null;
        this.element = null;
        this.touchStartHandler = function (e) {
            _this.touchStart(e);
        };
        this.touchMoveHandler = function (e) {
            _this.touchMove(e);
        };
    }
    SwipeService.prototype.touchStart = function (evt) {
        this.xDown = evt.touches[0].clientX;
        this.yDown = evt.touches[0].clientY;
    };
    SwipeService.prototype.touchMove = function (evt) {
        if (!this.xDown || !this.yDown) {
            return;
        }
        var xUp = evt.touches[0].clientX;
        var yUp = evt.touches[0].clientY;
        var xDiff = this.xDown - xUp;
        var yDiff = this.yDown - yUp;
        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            if (xDiff > 0) {
                /* left swipe */
                console.log("LEFT SWIPE");
            }
            else {
                /* right swipe */
                console.log("RIGHT SWIPE");
            }
        }
        else {
            if (yDiff > 0) {
                /* up swipe */
                console.log("UP SWIPE");
            }
            else {
                /* down swipe */
                console.log("DOWN SWIPE");
            }
        }
        /* reset values */
        this.xDown = null;
        this.yDown = null;
    };
    ;
    SwipeService.prototype.add = function (element) {
        this.element = element;
        this.element.addEventListener('touchstart', this.touchStartHandler, false);
        this.element.addEventListener('touchmove', this.touchMoveHandler, false);
    };
    SwipeService.prototype.destroy = function () {
        this.element.removeEventListener('touchstart', this.touchStartHandler, false);
        this.element.removeEventListener('touchmove', this.touchMoveHandler, false);
    };
    return SwipeService;
}());
SwipeService = __decorate([
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Injectable"])(),
    __metadata("design:paramtypes", [])
], SwipeService);

//# sourceMappingURL=swipe.service.js.map

/***/ }),

/***/ "../../../../../src/assets/css/reset.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, "/* http://meyerweb.com/eric/tools/css/reset/ \n   v2.0 | 20110126\n   License: none (public domain)\n*/\n\nhtml, body, div, span, applet, object, iframe,\nh1, h2, h3, h4, h5, h6, p, blockquote, pre,\na, abbr, acronym, address, big, cite, code,\ndel, dfn, em, img, ins, kbd, q, s, samp,\nsmall, strike, strong, sub, sup, tt, var,\nb, u, i, center,\ndl, dt, dd, ol, ul, li,\nfieldset, form, label, legend,\ntable, caption, tbody, tfoot, thead, tr, th, td,\narticle, aside, canvas, details, embed, \nfigure, figcaption, footer, header, hgroup, \nmenu, nav, output, ruby, section, summary,\ntime, mark, audio, video {\n\tmargin: 0;\n\tpadding: 0;\n\tborder: 0;\n\tfont-size: 100%;\n\tfont: inherit;\n\tvertical-align: baseline;\n}\n/* HTML5 display-role reset for older browsers */\narticle, aside, details, figcaption, figure, \nfooter, header, hgroup, menu, nav, section {\n\tdisplay: block;\n}\nbody {\n\tline-height: 1;\n}\nol, ul {\n\tlist-style: none;\n}\nblockquote, q {\n\tquotes: none;\n}\nblockquote:before, blockquote:after,\nq:before, q:after {\n\tcontent: '';\n\tcontent: none;\n}\ntable {\n\tborder-collapse: collapse;\n\tborder-spacing: 0;\n}", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/assets/css/style.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, "\n@font-face {\n    font-family: 'titillium-web-light';\n    src: url(" + __webpack_require__("../../../../../src/assets/css/typos/titilliumweb-light-webfont.eot") + ");\n    src: url(" + __webpack_require__("../../../../../src/assets/css/typos/titilliumweb-light-webfont.eot") + "?#iefix) format('embedded-opentype'),\n         url(" + __webpack_require__("../../../../../src/assets/css/typos/titilliumweb-light-webfont.woff2") + ") format('woff2'),\n         url(" + __webpack_require__("../../../../../src/assets/css/typos/titilliumweb-light-webfont.woff") + ") format('woff'),\n         url(" + __webpack_require__("../../../../../src/assets/css/typos/titilliumweb-light-webfont.ttf") + ") format('truetype'),\n         url(" + __webpack_require__("../../../../../src/assets/css/typos/titilliumweb-light-webfont.svg") + "#titillium_weblight) format('svg');\n    font-weight: normal;\n    font-style: normal;\n}\n\n@font-face {\n    font-family: 'titillium-web-regular';\n    src: url(" + __webpack_require__("../../../../../src/assets/css/typos/titilliumweb-regular-webfont.eot") + ");\n    src: url(" + __webpack_require__("../../../../../src/assets/css/typos/titilliumweb-regular-webfont.eot") + "?#iefix) format('embedded-opentype'),\n         url(" + __webpack_require__("../../../../../src/assets/css/typos/titilliumweb-regular-webfont.woff2") + ") format('woff2'),\n         url(" + __webpack_require__("../../../../../src/assets/css/typos/titilliumweb-regular-webfont.woff") + ") format('woff'),\n         url(" + __webpack_require__("../../../../../src/assets/css/typos/titilliumweb-regular-webfont.ttf") + ") format('truetype'),\n         url(" + __webpack_require__("../../../../../src/assets/css/typos/titilliumweb-regular-webfont.svg") + "#titillium_webregular) format('svg');\n    font-weight: normal;\n    font-style: normal;\n}\n\n@font-face {\n    font-family: 'titillium-web-semibold';\n    src: url(" + __webpack_require__("../../../../../src/assets/css/typos/titilliumweb-semibold-webfont.eot") + ");\n    src: url(" + __webpack_require__("../../../../../src/assets/css/typos/titilliumweb-semibold-webfont.eot") + "?#iefix) format('embedded-opentype'),\n         url(" + __webpack_require__("../../../../../src/assets/css/typos/titilliumweb-semibold-webfont.woff2") + ") format('woff2'),\n         url(" + __webpack_require__("../../../../../src/assets/css/typos/titilliumweb-semibold-webfont.woff") + ") format('woff'),\n         url(" + __webpack_require__("../../../../../src/assets/css/typos/titilliumweb-semibold-webfont.ttf") + ") format('truetype'),\n         url(" + __webpack_require__("../../../../../src/assets/css/typos/titilliumweb-semibold-webfont.svg") + "#titillium_websemibold) format('svg');\n    font-weight: normal;\n    font-style: normal;\n}\n\n@font-face {\n  font-family: \"sweetq\";\n  src:url(" + __webpack_require__("../../../../../src/assets/css/typos/sweetq1.eot") + ");\n  src:url(" + __webpack_require__("../../../../../src/assets/css/typos/sweetq1.eot") + "?#iefix) format(\"embedded-opentype\"),\n    url(" + __webpack_require__("../../../../../src/assets/css/typos/sweetq1.woff") + ") format(\"woff\"),\n    url(" + __webpack_require__("../../../../../src/assets/css/typos/sweetq1.ttf") + ") format(\"truetype\"),\n    url(" + __webpack_require__("../../../../../src/assets/css/typos/sweetq1.svg") + "#sweetq) format(\"svg\");\n  font-weight: normal;\n  font-style: normal;\n\n}\n\n@font-face {\n    font-family: 'interstate-light';\n    src: url(" + __webpack_require__("../../../../../src/assets/css/typos/interstate_light_comp-webfont.eot") + ");\n    src: url(" + __webpack_require__("../../../../../src/assets/css/typos/interstate_light_comp-webfont.eot") + "?#iefix) format('embedded-opentype'),\n         url(" + __webpack_require__("../../../../../src/assets/css/typos/interstate_light_comp-webfont.woff2") + ") format('woff2'),\n         url(" + __webpack_require__("../../../../../src/assets/css/typos/interstate_light_comp-webfont.woff") + ") format('woff'),\n         url(" + __webpack_require__("../../../../../src/assets/css/typos/interstate_light_comp-webfont.ttf") + ") format('truetype'),\n         url(" + __webpack_require__("../../../../../src/assets/css/typos/interstate_light_comp-webfont.svg") + "#interstateregular) format('svg');\n    font-weight: normal;\n    font-style: normal;\n}\n\n@font-face {\n    font-family: 'interstate-regular';\n    src: url(" + __webpack_require__("../../../../../src/assets/css/typos/interstate_regular_comp-webfont.eot") + ");\n    src: url(" + __webpack_require__("../../../../../src/assets/css/typos/interstate_regular_comp-webfont.eot") + "?#iefix) format('embedded-opentype'),\n         url(" + __webpack_require__("../../../../../src/assets/css/typos/interstate_regular_comp-webfont.woff2") + ") format('woff2'),\n         url(" + __webpack_require__("../../../../../src/assets/css/typos/interstate_regular_comp-webfont.woff") + ") format('woff'),\n         url(" + __webpack_require__("../../../../../src/assets/css/typos/interstate_regular_comp-webfont.ttf") + ") format('truetype'),\n         url(" + __webpack_require__("../../../../../src/assets/css/typos/interstate_regular_comp-webfont.svg") + "#interstateregular) format('svg');\n    font-weight: normal;\n    font-style: normal;\n}\n\n[data-icon]:before {\n  font-family: \"sweetq\" !important;\n  content: attr(data-icon);\n  font-style: normal !important;\n  font-weight: normal !important;\n  font-variant: normal !important;\n  text-transform: none !important;\n  speak: none;\n  line-height: 1;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n\n[class^=\"icon-\"]:before,\n[class*=\" icon-\"]:before {\n  font-family: \"sweetq\" !important;\n  font-style: normal !important;\n  font-weight: normal !important;\n  font-variant: normal !important;\n  text-transform: none !important;\n  speak: none;\n  line-height: 1;\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n\n.icon-amazon:before {\n    content: \"c\";\n}\n.icon-apple-music:before {\n    content: \"d\";\n}\n.icon-facebook:before {\n    content: \"e\";\n}\n.icon-google-play:before {\n    content: \"f\";\n}\n.icon-instagram:before {\n    content: \"g\";\n}\n.icon-mail:before {\n    content: \"h\";\n}\n.icon-play:before {\n    content: \"i\";\n}\n.icon-soundcloud:before {\n    content: \"j\";\n}\n.icon-spotify:before {\n    content: \"k\";\n}\n.icon-twitter:before {\n    content: \"l\";\n}\n.icon-youtube:before {\n    content: \"m\";\n}\n.icon-gigs:before {\n    content: \"b\";\n}\n.icon-bandzaai:before {\n    content: \"a\";\n}\n\nhtml {\n    width: 100%;\n    height: 100%;\n    -webkit-font-smoothing: antialiased;\n    -moz-osx-font-smoothing: auto;\n}\n\nbody {\n    width: 100%;\n    height: 100%;\n    font-family: 'titillium-web-regular';\n    color: #16181a;\n}\n\n.visuallyhidden {\n    border: 0;\n    clip: rect(0 0 0 0);\n    height: 1px;\n    margin: -1px;\n    overflow: hidden;\n    padding: 0;\n    position: absolute;\n    width: 1px;\n}\n\n.bold {\n    font-family: 'titillium-web-semibold';\n}\n\n.sq-icon {\n    background-position: center;\n    background-repeat: no-repeat;\n    background-size: contain;\n}\n\n.sq-button .sq-icon.icon-gigs {\n    font-size: 21px;\n}\n\n* {\n    transition: all .1s linear;\n}\n\n.sq-line > * {\n    display: inline-block;\n    vertical-align: middle;\n}\n\n.flex-width {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center;\n}\n\n.sq-bg {\n    width: 100%;\n    height: 100%;\n    max-height: 768px;\n    min-height: 500px;\n    color: #fff;\n    background-image: url(" + __webpack_require__("../../../../../src/assets/imgs/img-sweet-q.png") + ");\n    background-position: center;\n    background-repeat: no-repeat;\n    background-size: cover;\n    position: relative;\n}\n\n.sq-bg:before {\n    content: '';\n    display: block;\n    height: 100%;\n    width: 100%;\n    background: #000;\n    position: absolute;\n    top: 0;\n    left: 0;\n    opacity: .3;\n}\n\n.sq-wrapper {\n    max-width: 1200px;\n    height: 100%;\n    position: relative;\n    margin: 0 auto;\n    text-align: center;\n}\n.sq-logo {\n    position: absolute;\n    left: 50%;\n    top: 30px;\n    -webkit-transform: translateX(-50%);\n            transform: translateX(-50%);\n    transition: top .25s linear;\n}\n\n.sq-logo .sq-logo-image {\n    width: 162px;\n    height: 68px;\n    margin: 0 auto;\n    background-image: url(" + __webpack_require__("../../../../../src/assets/imgs/logo-sweetq.svg") + ");\n    background-repeat: no-repeat;\n    background-size: cover;\n    transition: all .25s linear;\n}\n\n.sq-headline {\n    font-size: 24px;\n    line-height: 30px;\n    padding: 0 10px 30px 10px;\n}\n\n.sq-text {\n    font-size: 20px;\n    line-height: 28px;\n}\n\n.sq-text .bold {\n    font-family: 'titillium-web-semibold';\n}\n\n.sq-button {\n    display: -webkit-inline-box;\n    display: -ms-inline-flexbox;\n    display: inline-flex;\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center;\n    padding: 6px;\n    box-sizing: border-box;\n    border-radius: 3px;\n    text-align: center;\n    cursor: pointer;\n    background-color: transparent;\n    text-transform: none;\n    text-decoration: none;\n    transition: box-shadow .15s ease-out;\n}\n\n.sq-button.mini-padding {\n    padding: 2px;\n}\n\n.sq-button.disabled {\n    cursor: default;\n}\n\n.sq-button .sq-icon {\n    position: relative;\n    display: block;\n    height: 38px;\n    width: 38px;\n    font-size: 34px;\n    color: #FFFFFF;\n}\n\n.sq-button .sq-icon:before {\n    position: absolute;\n    top: 50%;\n    left: 50%;\n    -webkit-transform: translateX(-50%) translateY(-50%);\n            transform: translateX(-50%) translateY(-50%);\n}\n\n.sq-button .sq-button-text {\n    height: 38px;\n    line-height: 38px;\n    padding: 0px 14px;\n    font-family: 'titillium-web-semibold';\n    font-size: 16px;\n}\n\n.sq-button.rounded {\n    border-radius: 80px;\n}\n\n.sq-button.solid-blue {\n    color: #fff;\n    background-color: #24aeb8;\n    box-shadow: 0 0 0 0 rgba(36, 174, 184, 0);\n}\n    .sq-button.solid-blue:hover {\n        box-shadow: 0 0 0 3px rgba(36, 174, 184, 0.3);\n\n    }\n\n.sq-button.line-blue {\n    color: #24aeb8;\n    box-shadow: inset 0 0 1px 0 #24aeb8;\n}\n    .sq-button.line-blue:hover {\n        box-shadow: inset 0 0 1px 0 #24aeb8, 0 0 0 3px rgba(36, 174, 184, 0.3);\n    }\n.sq-button.line-blue .sq-icon {\n    color: #24aeb8;\n}\n\n.sq-button.sq-spotify {\n    padding: 6px 10px 6px 6px;\n    background-color: #1db954;\n    border: solid 1px #1db954;\n    border-radius: 50px;\n    box-shadow: 0 0 0 0 rgba(29, 185, 84, 0.5);\n}\n.sq-button.sq-spotify:hover {\n    box-shadow: 0 0 0 4px rgba(29, 185, 84, 0.5);\n}\n.sq-button .sq-icon.icon-spotify:before {\n    top: calc(50% + 2px);\n}\n\n.sq-section .sq-title-wrapper {\n    padding-bottom: 30px;\n}\n\n.sq-section .sq-subtitle {\n    font-family: 'interstate-light';\n    font-size: 36px;\n    text-transform: uppercase;\n}\n\n.sq-ep {\n    left: 50%;\n    position: relative;\n    -webkit-transform: translate(-50%, -50%);\n            transform: translate(-50%, -50%);\n}\n\n.sq-ep.sq-hero {\n    top: 50%;\n}\n\n.sq-platforms {\n    position: absolute;\n    bottom: 40px;\n    left: 50%;\n    -webkit-transform: translateX(-50%);\n            transform: translateX(-50%);\n    min-width: 270px;\n}\n\n.sq-platforms .sq-text {\npadding-bottom: 22px;\n}\n.sq-platforms-icons {\n    margin-top: 20px;\n}\n\n.sq-platforms-icons .sq-button {\n    margin: 0 10px;\n}\n\n.sq-platforms-icons .sq-button.disabled:hover .sq-icon {\n    font-size: 34px;\n    transition: none;\n    cursor: default;\n}    \n\n.sq-platforms-icons .sq-button .sq-icon {\n    transition: all .1s cubic-bezier(0.4, 0, 1, 1);\n}\n.sq-platforms-icons .sq-button:hover .sq-icon {\n    font-size: 42px;\n    color: #fff;\n}\n\n.sq-contact-icons {\n    text-align: center;\n    padding: 40px 0;\n    background-color: #16181a;\n}\n.sq-contact-icons .sq-button {\n    padding: 6px 12px;\n}\n.sq-contact-icons .sq-button .sq-icon {\n    height: 30px;\n    width: 30px;\n    font-size: 26px;\n    color: #c1c5cb;\n    transition: all .1s cubic-bezier(0.4, 0, 1, 1);\n}\n.sq-contact-icons .sq-button:hover .sq-icon {\n    font-size: 32px;\n    color: #fff;\n}\n\n.sq-modal {\n    position: fixed;\n    height: 100%;\n    width: 100%;\n    background-color: rgba(0, 0, 0, 0.75);\n    top: 0;\n    left: 0;\n}\n\n.sq-modal-preview {\n    position: fixed;\n    height: 100%;\n    width: 100%;\n    top: 0;\n    left: 0;\n    text-align: center;\n}\n\n.sq-modal-preview iframe,\n.sq-modal-preview object,\n.sq-modal-preview embed\n {\n    margin: 0 auto;\n\twidth:95%;\n\theight:95%;\n}\n\n.sq-modal-preview iframe {\n    padding: 2% 0;\n}\n\n\n.sq-modal-preview.spotify iframe {    \n    max-width: 350px;\n    max-height: 280px;\n    position: absolute;\n    -webkit-transform: translate(-50%,-50%);\n            transform: translate(-50%,-50%);\n    top: 50%;\n}\n\n.sq-section {\n    padding: 50px 20px; \n    box-sizing: content-box;\n}\n\n.sq-half-columns {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center;\n}\n\n.sq-half-columns .sq-column {\n    -webkit-box-flex: 1;\n        -ms-flex: 1;\n            flex: 1;\n}\n\n.sq-image-wrapper {\n    width: 100%;\n}\n\n.sq-image-wrapper video{\n    width:  100%;\n    height: 100%;\n}\n\n.concierto .sq-image-wrapper {\n    max-width: 400px;\n}\n\n.sq-section.concierto .column-right {\n    padding: 0px 24px;\n}\n\n.sq-image {\n    box-sizing: border-box;\n    background-size: contain;\n    background-size: cover;\n    background-repeat: no-repeat;\n}\n\n.sq-image-wrapper.square .sq-image {\n    width: 100%;\n    padding-top: calc(100% + 30px);\n}\n\n.sq-aside-actions {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center;\n}\n.sq-aside-actions .sq-button {\n    margin-left: 10px;\n}\n\n/* Kit notice */\n.sq-section.notice .sq-wrapper {\n    max-width: 1024px;\n}\n.sq-section.notice .sq-title {\n    font-family: 'interstate-regular';\n    color: #16181a;\n    font-size: 70px;\n    text-transform: uppercase;\n}\n.sq-section.notice .sq-subtitle {\n    color: #9f876a;\n    padding: 10px 0;\n}\n.sq-section.notice .sq-text {\n    padding: 0 65px 22px 0;\n}\n.sq-section.notice .sq-actions {\n    padding-top: 32px;\n}\n.sq-section.notice .sq-image-wrapper {\n    width: 75%;\n    margin: 0 auto;\n}\n\n.sq-section.notice.info .sq-image.image-cover {\n    background-image: url(" + __webpack_require__("../../../../../src/assets/imgs/cover.png") + ");    \n    position: relative;\n}\n\n.sq-section.notice.info .column-right {\n    text-align: left;\n}\n\n/* Kit prensa */\n.sq-section.kit {\n    background-color: #282c33;\n}\n.sq-section.kit .sq-subtitle {\n    color: #24adb7;\n}\n.sq-section.kit .sq-text {\n    color: #e3e6ea;\n    padding-bottom: 10px;\n}\n.sq-section.kit .peso {\n    font-size: 13px;\n    font-family: 'titillium-web-regular';\n    color: rgba(255, 255, 255, 0.8);\n}\n.sq-section.kit .sq-actions {\n    padding-top: 32px;\n}\n\n/* Gigs */\n.sq-section.gigs {\n    padding: 70px 20px 100px 20px;\n    background-color: #16181a;\n    color: #fff;\n}\n.sq-section.gigs .sq-title-wrapper {\n    padding-bottom: 60px;\n}\n.sq-section.gigs .sq-subtitle {\n    color: #e3e6ea;\n}\n.gigs .sq-gigs-list {\n    text-align: center;\n}\n.gigs .sq-gigs-list .sq-item {\n    width: 100%;\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center;\n    margin: 0 0 -1px 0px;\n    padding: 16px;\n    box-sizing: border-box;\n    line-height: 18px;\n    border-bottom: 1px solid #6d7179;\n    border-top: 1px solid #6d7179;\n    text-align: left;\n    margin-bottom: -1px;\n}\n.gigs .sq-gigs-list.half-width .sq-item {\n    display: -webkit-inline-box;\n    display: -ms-inline-flexbox;\n    display: inline-flex;\n    -webkit-box-align: center;\n    -ms-flex-align: center;\n        align-items: center;\n    width: 48%;\n}\n.gigs .sq-gigs-list.half-width .sq-item:nth-child(2n+1) {\n    margin-right: 17px;\n}\n.gigs .sq-gigs-list.half-width .sq-item:nth-child(2n) {\n    margin-left: 17px;\n}\n\n.gigs .sq-gigs-list > .sq-text {\n    text-align: center;\n}\n.gigs .sq-item .sq-item-data {\n    padding: 0 10px 0 22px;\n    width: 100%;\n    -webkit-box-flex: 1;\n        -ms-flex: 1;\n            flex: 1;\n}\n.gigs .sq-item .sq-item-data .sq-title {\n    height: 28px;\n    position: relative;\n}\n.gigs .sq-item .sq-item-data .sq-gig-info, \n.gigs .sq-item .sq-item-data .sq-participants {\n    height: 22px;\n    position: relative;\n}\n.gigs .sq-item .sq-item-data .sq-participants .sq-line {\n    color: #24aeb8;\n}\n.gigs .sq-item .sq-item-data .sq-item-title {\n    font-size: 18.5px;\n    line-height: 28px;\n    font-weight: 700;\n    width: 100%;\n    position: absolute;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n}\n.gigs .sq-item .sq-item-data .sq-gig-info .sq-line, \n.gigs .sq-item .sq-item-data .sq-participants .sq-line {\n    width: 100%;\n    position: absolute;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n}\n.gigs .sq-item .sq-text {\n    font-size: 16px;\n    line-height: 22px;\n}\n.gigs .sq-item .sq-item-data .sq-gig-info .sq-text, \n.gigs .sq-item .sq-item-data .sq-gig-info .sq-line-space {\n    color: #c1c5cb;\n}\n.gigs .sq-item .sq-item-data .sq-participants .sq-text, \n.gigs .sq-item .sq-item-data .sq-participants .sq-line-space, \n.gigs .sq-item .sq-item-data .sq-participants .sq-text .sq-link {\n    color: #24aeb8;\n    text-decoration: none;\n    display: inline;\n}\n.gigs .sq-gigs-list .sq-item.old-gig {\n    opacity: .3;\n}\n\n.sq-gig-day {\n    text-align: center;\n    padding: 0 4px;\n}\n.sq-gig-day > .day {\n    font-size: 40px;\n    line-height: 42px;\n    text-transform: uppercase;\n    display: block;\n}\n.sq-gig-day > .month {\n    font-size: 22px;\n    line-height: 24px;\n    text-transform: uppercase;\n    display: block;\n}\n\n/* Videos */\n.sq-section.videos {\n    padding: 70px 20px 30px 20px;\n    background-color: #282c33;\n    color: #fff;\n}\n.sq-section.videos .sq-title-wrapper {\n    padding-bottom: 60px;\n    text-align: center;\n}\n.sq-section.videos .sq-subtitle {\n    color: #e3e6ea;\n}\n.sq-videos-list .sq-item {\n    margin-bottom: 24px;\n}\n.sq-video {\n    cursor: pointer;\n    z-index: 1;\n    border-radius: 2px;\n    overflow: hidden;\n}\n.sq-video .sq-frame {\n    position: relative;\n    width: 100%;\n    padding-top: 42.6%;\n    box-sizing: border-box;    \n    background-size: contain;\n    background-size: cover;\n    background-repeat: no-repeat;\n    box-shadow: 0 0 1px 1px #15181b;\n}\n\n.sq-video.cosasclaras .sq-frame {\n    background-image: url(" + __webpack_require__("../../../../../src/assets/imgs/cosasclaras.png") + ");\n}\n.sq-video.nuevaera .sq-frame {\n    background-image: url(" + __webpack_require__("../../../../../src/assets/imgs/nuevaera.png") + ");\n}\n.sq-video.mal .sq-frame {\n    background-image: url(" + __webpack_require__("../../../../../src/assets/imgs/mal.png") + ");\n}\n.sq-video .sq-video-title {\n    padding-top: 18px;\n}\n.sq-video .sq-video-title-text {\n    font-size: 20px;\n    line-height: 24px;\n    font-family: 'titillium-web-semibold';\n    padding: 6px 10px;\n    display: inline-block;\n}\n.sq-video:hover .sq-video-title-text {\n    background-color: rgba(21, 24, 27, 0.75);\n    border-radius: 3px;\n}\n.sq-play-wrapper {\n    position: absolute;\n    top: 50%;\n    left: 50%;\n    -webkit-transform: translate(-50%, -50%);\n            transform: translate(-50%, -50%);\n}\n.sq-button .sq-icon.icon-play {\n    height: 88px;\n    width: 88px;\n    font-size: 74px;\n    transition: all .2s cubic-bezier(0.4, 0, 1, 1);\n    opacity: .9;\n}\n.sq-video:hover .sq-button .sq-icon.icon-play {\n    font-size: 88px;\n    opacity: 1;\n}\n\n.sq-videos-list.flex-width .sq-item {\n    -webkit-box-flex: 1;\n        -ms-flex: 1;\n            flex: 1;\n    margin: 0 18px 24px 18px;\n}\n\n\n@media (max-width: 767px) {\n\n    .sq-button .sq-icon.icon-play {\n        height: 68px;\n        width: 68px;\n        font-size: 58px;\n    }\n    .sq-video:hover .sq-button .sq-icon.icon-play {\n        font-size: 72px;\n    }\n    .sq-video .sq-frame .sq-video-title-text {\n        font-size: 18px;\n    }\n    .sq-contact-icons {\n        padding: 20px 0;\n    }\n    .sq-ep.sq-platforms {\n        top: 66%;\n    }\n}\n\n@media (max-width: 660px) {\n    .sq-half-columns {\n        display: block;\n        transition: all .5s linear;\n    }\n    .sq-image-wrapper {\n        margin: 0 auto;\n    }\n    .notice.concierto .sq-image-wrapper {\n        max-width: 320px;\n    }\n    .sq-section .sq-title {\n        font-size: 54px;\n    }\n    .sq-section .sq-text {\n        font-size: 18px;\n        line-height: 26px;\n    }\n    .sq-section .sq-actions {\n        padding-top: 8px;\n    }\n    .sq-section.gigs {\n        padding: 50px 20px 80px 20px;\n    }\n    .sq-section.gigs .sq-title-wrapper {\n        padding-bottom: 50px;\n    }\n    .sq-section.videos {\n        padding: 50px 20px 20px 20px;\n    }\n    .sq-section.videos .sq-title-wrapper {\n        padding-bottom: 50px;\n    }\n    .sq-section.notice .sq-image-wrapper {\n        margin: 0 auto 38px auto;\n        max-width: 200px;\n    }\n    .sq-section.notice.info .sq-image-wrapper {\n        margin: 0 auto;\n    }\n    .sq-section.notice.info {\n        padding: 20px 20px 50px 20px;\n    }\n    .sq-section .sq-title-wrapper {\n        text-align: center;\n    }\n    .sq-section.notice .sq-text {\n        padding: 0;\n    }\n}\n\n@media (max-width: 480px) {\n    \n    .sq-button .sq-icon.icon-play {\n        height: 52px;\n        width: 52px;\n        font-size: 40px;\n    }\n    .sq-video:hover .sq-button .sq-icon.icon-play {\n        font-size: 52px;\n    }\n    .sq-video .sq-frame .sq-video-title-text {\n        font-size: 16px;\n    }\n    .sq-contact-icons {\n        padding: 14px 0;\n    }\n    .sq-contact-icons .sq-button .sq-icon {\n        font-size: 22px;\n    }\n    .notice.concierto .sq-image-wrapper {\n        max-width: 270px;\n    }\n    .gigs .sq-gigs-list .sq-item {\n        display: block;\n    }\n    .gigs .sq-gigs-list .sq-item > div {\n        display: inline-block;\n        vertical-align: middle;\n    }\n    .gigs .sq-gigs-list .sq-item .sq-gig-day {\n        width: 46px;\n    }\n    .gigs .sq-gigs-list .sq-item .sq-item-data {\n        width: calc(100% - 90px);\n    }\n    .gigs .sq-gigs-list .sq-item .sq-item-aside {\n        padding: 10px 0 0 66px;\n    }\n    .sq-section.gigs .sq-title-wrapper {\n        padding-bottom: 40px;\n    }\n    .sq-section.videos .sq-title-wrapper {\n        padding-bottom: 40px;\n    }\n    .sq-headline {\n        font-size: 22px;\n        line-height: 28px;\n        max-width: 244px;\n        margin: 0 auto;\n    }\n    .sq-platforms .sq-text {\n        font-size: 16px;\n        line-height: 22px;\n        padding-bottom: 14px;\n    }\n    .sq-platforms-icons .sq-button {\n        margin: 0px 8px;\n    }\n    .sq-button .sq-icon {\n        font-size: 30px;\n    }\n}\n\n@media (max-width: 380px) {\n    \n    .sq-video .sq-frame .sq-video-title-text {\n        font-size: 14px;\n    }\n    .sq-button .sq-icon.icon-play {\n        height: 40px;\n        width: 40px;\n        font-size: 30px;\n    }\n    .sq-video:hover .sq-button .sq-icon.icon-play {\n        font-size: 42px;\n    }\n    .sq-section .sq-subtitle {\n        font-size: 32px;\n    }\n    .sq-section.gigs .sq-title-wrapper {\n        padding-bottom: 32px;\n    }\n    .sq-section.gigs {\n        padding: 42px 20px 58px 20px;\n    }\n    .sq-section.videos {\n        padding: 36px 20px 10px 20px;\n    }\n    .sq-section.videos .sq-title-wrapper {\n        padding-bottom: 32px;\n    }\n    .sq-video .sq-video-title-text {\n        font-size: 18px;\n        line-height: 22px;\n        padding: 4px 10px;\n    }\n    .sq-section.notice .sq-text {\n        padding-bottom: 2px;\n    }\n    .sq-section .sq-title-wrapper {\n        padding-bottom: 22px;\n    }\n    .sq-section.notice .sq-image-wrapper {\n        margin: 0 auto 38px auto;\n        max-width: 170px;\n    }\n    .sq-section.kit .sq-text {\n        max-width: 254px;\n        margin: 0 auto;\n    }\n    .sq-section.notice .sq-title-wrapper {\n        margin-top: 40px;\n    }\n}\n\n@media (max-height: 767px) {\n    .sq-logo {\n        top: 20px;\n    }\n    .sq-logo .sq-logo-image {\n        width: 130px;\n        height: 56px;\n    }\n}\n@media (max-height: 520px) {\n    .sq-platforms {\n        bottom: 24px;\n    }\n}\n\n@media (min-width: 1440px) {\n    .sq-bg {\n        max-height: 60vh;\n    }\n}\n@media (min-width: 2560px) {\n    .sq-bg {\n        max-height: 70vh;\n    }\n}", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/assets/css/typos/interstate_light_comp-webfont.eot":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "interstate_light_comp-webfont.1c2c7c64a9a801a6ff7e.eot";

/***/ }),

/***/ "../../../../../src/assets/css/typos/interstate_light_comp-webfont.svg":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "interstate_light_comp-webfont.d136af60ad71a809786d.svg";

/***/ }),

/***/ "../../../../../src/assets/css/typos/interstate_light_comp-webfont.ttf":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "interstate_light_comp-webfont.5903da2b7c492c397fdf.ttf";

/***/ }),

/***/ "../../../../../src/assets/css/typos/interstate_light_comp-webfont.woff":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "interstate_light_comp-webfont.b5bfa44fbf0f024780e2.woff";

/***/ }),

/***/ "../../../../../src/assets/css/typos/interstate_light_comp-webfont.woff2":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "interstate_light_comp-webfont.3b7ca331a6660b840189.woff2";

/***/ }),

/***/ "../../../../../src/assets/css/typos/interstate_regular_comp-webfont.eot":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "interstate_regular_comp-webfont.aa779369a7e5ccad71a4.eot";

/***/ }),

/***/ "../../../../../src/assets/css/typos/interstate_regular_comp-webfont.svg":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "interstate_regular_comp-webfont.9983cd9280006a90fb8f.svg";

/***/ }),

/***/ "../../../../../src/assets/css/typos/interstate_regular_comp-webfont.ttf":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "interstate_regular_comp-webfont.24186de7b71efdada72e.ttf";

/***/ }),

/***/ "../../../../../src/assets/css/typos/interstate_regular_comp-webfont.woff":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "interstate_regular_comp-webfont.f1939db055d91aa3facd.woff";

/***/ }),

/***/ "../../../../../src/assets/css/typos/interstate_regular_comp-webfont.woff2":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "interstate_regular_comp-webfont.ec9367869f85cfbb54e0.woff2";

/***/ }),

/***/ "../../../../../src/assets/css/typos/sweetq1.eot":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "sweetq1.e206117cf6effd33a47e.eot";

/***/ }),

/***/ "../../../../../src/assets/css/typos/sweetq1.svg":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "sweetq1.d5ee260e6db702b0604f.svg";

/***/ }),

/***/ "../../../../../src/assets/css/typos/sweetq1.ttf":
/***/ (function(module, exports) {

module.exports = "data:application/x-font-ttf;base64,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"

/***/ }),

/***/ "../../../../../src/assets/css/typos/sweetq1.woff":
/***/ (function(module, exports) {

module.exports = "data:application/font-woff;base64,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"

/***/ }),

/***/ "../../../../../src/assets/css/typos/titilliumweb-light-webfont.eot":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "titilliumweb-light-webfont.d652f85ea224688c236b.eot";

/***/ }),

/***/ "../../../../../src/assets/css/typos/titilliumweb-light-webfont.svg":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "titilliumweb-light-webfont.162ae3ff241fbb9364b2.svg";

/***/ }),

/***/ "../../../../../src/assets/css/typos/titilliumweb-light-webfont.ttf":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "titilliumweb-light-webfont.03523468d7de05d29af8.ttf";

/***/ }),

/***/ "../../../../../src/assets/css/typos/titilliumweb-light-webfont.woff":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "titilliumweb-light-webfont.8d36cc9390ecd0686b17.woff";

/***/ }),

/***/ "../../../../../src/assets/css/typos/titilliumweb-light-webfont.woff2":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "titilliumweb-light-webfont.7bf2eb40414792f8d63d.woff2";

/***/ }),

/***/ "../../../../../src/assets/css/typos/titilliumweb-regular-webfont.eot":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "titilliumweb-regular-webfont.7bfb144b130522b4ccb8.eot";

/***/ }),

/***/ "../../../../../src/assets/css/typos/titilliumweb-regular-webfont.svg":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "titilliumweb-regular-webfont.73332a32879c4f5d78b3.svg";

/***/ }),

/***/ "../../../../../src/assets/css/typos/titilliumweb-regular-webfont.ttf":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "titilliumweb-regular-webfont.501146edbbe3083f2c92.ttf";

/***/ }),

/***/ "../../../../../src/assets/css/typos/titilliumweb-regular-webfont.woff":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "titilliumweb-regular-webfont.d13d9ec5dcfb6f69ee45.woff";

/***/ }),

/***/ "../../../../../src/assets/css/typos/titilliumweb-regular-webfont.woff2":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "titilliumweb-regular-webfont.fed98e8c2004f06e5d4a.woff2";

/***/ }),

/***/ "../../../../../src/assets/css/typos/titilliumweb-semibold-webfont.eot":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "titilliumweb-semibold-webfont.a1d256b0cbc9253a4695.eot";

/***/ }),

/***/ "../../../../../src/assets/css/typos/titilliumweb-semibold-webfont.svg":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "titilliumweb-semibold-webfont.67bc9232e69bd6e0b70d.svg";

/***/ }),

/***/ "../../../../../src/assets/css/typos/titilliumweb-semibold-webfont.ttf":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "titilliumweb-semibold-webfont.cbadb6dc64e23ebb6cb3.ttf";

/***/ }),

/***/ "../../../../../src/assets/css/typos/titilliumweb-semibold-webfont.woff":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "titilliumweb-semibold-webfont.402f2fa09cbb30664c17.woff";

/***/ }),

/***/ "../../../../../src/assets/css/typos/titilliumweb-semibold-webfont.woff2":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "titilliumweb-semibold-webfont.3719787f7f5a8e0846c0.woff2";

/***/ }),

/***/ "../../../../../src/assets/imgs/cosasclaras.png":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "cosasclaras.91d143804a8268372762.png";

/***/ }),

/***/ "../../../../../src/assets/imgs/cover.png":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "cover.ec95419c324c929b148c.png";

/***/ }),

/***/ "../../../../../src/assets/imgs/img-sweet-q.png":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "img-sweet-q.d91591b1cff7bc017209.png";

/***/ }),

/***/ "../../../../../src/assets/imgs/logo-sweetq.svg":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "logo-sweetq.6e98a98f108ebc447cb4.svg";

/***/ }),

/***/ "../../../../../src/assets/imgs/mal.png":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "mal.019e8a96db2fcd6459ac.png";

/***/ }),

/***/ "../../../../../src/assets/imgs/nuevaera.png":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__.p + "nuevaera.b02cae166ab2f897a5ab.png";

/***/ }),

/***/ "../../../../../src/environments/environment.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return environment; });
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
// The file contents for the current environment will overwrite these during build.
var environment = {
    production: false
};
//# sourceMappingURL=environment.js.map

/***/ }),

/***/ "../../../../../src/main.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser_dynamic__ = __webpack_require__("../../../platform-browser-dynamic/@angular/platform-browser-dynamic.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__app_app_module__ = __webpack_require__("../../../../../src/app/app.module.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__environments_environment__ = __webpack_require__("../../../../../src/environments/environment.ts");




if (__WEBPACK_IMPORTED_MODULE_3__environments_environment__["a" /* environment */].production) {
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["enableProdMode"])();
}
Object(__WEBPACK_IMPORTED_MODULE_1__angular_platform_browser_dynamic__["a" /* platformBrowserDynamic */])().bootstrapModule(__WEBPACK_IMPORTED_MODULE_2__app_app_module__["a" /* AppModule */], []);
//# sourceMappingURL=main.js.map

/***/ }),

/***/ "../../../../moment/locale recursive ^\\.\\/.*$":
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./af": "../../../../moment/locale/af.js",
	"./af.js": "../../../../moment/locale/af.js",
	"./ar": "../../../../moment/locale/ar.js",
	"./ar-dz": "../../../../moment/locale/ar-dz.js",
	"./ar-dz.js": "../../../../moment/locale/ar-dz.js",
	"./ar-kw": "../../../../moment/locale/ar-kw.js",
	"./ar-kw.js": "../../../../moment/locale/ar-kw.js",
	"./ar-ly": "../../../../moment/locale/ar-ly.js",
	"./ar-ly.js": "../../../../moment/locale/ar-ly.js",
	"./ar-ma": "../../../../moment/locale/ar-ma.js",
	"./ar-ma.js": "../../../../moment/locale/ar-ma.js",
	"./ar-sa": "../../../../moment/locale/ar-sa.js",
	"./ar-sa.js": "../../../../moment/locale/ar-sa.js",
	"./ar-tn": "../../../../moment/locale/ar-tn.js",
	"./ar-tn.js": "../../../../moment/locale/ar-tn.js",
	"./ar.js": "../../../../moment/locale/ar.js",
	"./az": "../../../../moment/locale/az.js",
	"./az.js": "../../../../moment/locale/az.js",
	"./be": "../../../../moment/locale/be.js",
	"./be.js": "../../../../moment/locale/be.js",
	"./bg": "../../../../moment/locale/bg.js",
	"./bg.js": "../../../../moment/locale/bg.js",
	"./bm": "../../../../moment/locale/bm.js",
	"./bm.js": "../../../../moment/locale/bm.js",
	"./bn": "../../../../moment/locale/bn.js",
	"./bn.js": "../../../../moment/locale/bn.js",
	"./bo": "../../../../moment/locale/bo.js",
	"./bo.js": "../../../../moment/locale/bo.js",
	"./br": "../../../../moment/locale/br.js",
	"./br.js": "../../../../moment/locale/br.js",
	"./bs": "../../../../moment/locale/bs.js",
	"./bs.js": "../../../../moment/locale/bs.js",
	"./ca": "../../../../moment/locale/ca.js",
	"./ca.js": "../../../../moment/locale/ca.js",
	"./cs": "../../../../moment/locale/cs.js",
	"./cs.js": "../../../../moment/locale/cs.js",
	"./cv": "../../../../moment/locale/cv.js",
	"./cv.js": "../../../../moment/locale/cv.js",
	"./cy": "../../../../moment/locale/cy.js",
	"./cy.js": "../../../../moment/locale/cy.js",
	"./da": "../../../../moment/locale/da.js",
	"./da.js": "../../../../moment/locale/da.js",
	"./de": "../../../../moment/locale/de.js",
	"./de-at": "../../../../moment/locale/de-at.js",
	"./de-at.js": "../../../../moment/locale/de-at.js",
	"./de-ch": "../../../../moment/locale/de-ch.js",
	"./de-ch.js": "../../../../moment/locale/de-ch.js",
	"./de.js": "../../../../moment/locale/de.js",
	"./dv": "../../../../moment/locale/dv.js",
	"./dv.js": "../../../../moment/locale/dv.js",
	"./el": "../../../../moment/locale/el.js",
	"./el.js": "../../../../moment/locale/el.js",
	"./en-au": "../../../../moment/locale/en-au.js",
	"./en-au.js": "../../../../moment/locale/en-au.js",
	"./en-ca": "../../../../moment/locale/en-ca.js",
	"./en-ca.js": "../../../../moment/locale/en-ca.js",
	"./en-gb": "../../../../moment/locale/en-gb.js",
	"./en-gb.js": "../../../../moment/locale/en-gb.js",
	"./en-ie": "../../../../moment/locale/en-ie.js",
	"./en-ie.js": "../../../../moment/locale/en-ie.js",
	"./en-il": "../../../../moment/locale/en-il.js",
	"./en-il.js": "../../../../moment/locale/en-il.js",
	"./en-nz": "../../../../moment/locale/en-nz.js",
	"./en-nz.js": "../../../../moment/locale/en-nz.js",
	"./eo": "../../../../moment/locale/eo.js",
	"./eo.js": "../../../../moment/locale/eo.js",
	"./es": "../../../../moment/locale/es.js",
	"./es-do": "../../../../moment/locale/es-do.js",
	"./es-do.js": "../../../../moment/locale/es-do.js",
	"./es-us": "../../../../moment/locale/es-us.js",
	"./es-us.js": "../../../../moment/locale/es-us.js",
	"./es.js": "../../../../moment/locale/es.js",
	"./et": "../../../../moment/locale/et.js",
	"./et.js": "../../../../moment/locale/et.js",
	"./eu": "../../../../moment/locale/eu.js",
	"./eu.js": "../../../../moment/locale/eu.js",
	"./fa": "../../../../moment/locale/fa.js",
	"./fa.js": "../../../../moment/locale/fa.js",
	"./fi": "../../../../moment/locale/fi.js",
	"./fi.js": "../../../../moment/locale/fi.js",
	"./fo": "../../../../moment/locale/fo.js",
	"./fo.js": "../../../../moment/locale/fo.js",
	"./fr": "../../../../moment/locale/fr.js",
	"./fr-ca": "../../../../moment/locale/fr-ca.js",
	"./fr-ca.js": "../../../../moment/locale/fr-ca.js",
	"./fr-ch": "../../../../moment/locale/fr-ch.js",
	"./fr-ch.js": "../../../../moment/locale/fr-ch.js",
	"./fr.js": "../../../../moment/locale/fr.js",
	"./fy": "../../../../moment/locale/fy.js",
	"./fy.js": "../../../../moment/locale/fy.js",
	"./gd": "../../../../moment/locale/gd.js",
	"./gd.js": "../../../../moment/locale/gd.js",
	"./gl": "../../../../moment/locale/gl.js",
	"./gl.js": "../../../../moment/locale/gl.js",
	"./gom-latn": "../../../../moment/locale/gom-latn.js",
	"./gom-latn.js": "../../../../moment/locale/gom-latn.js",
	"./gu": "../../../../moment/locale/gu.js",
	"./gu.js": "../../../../moment/locale/gu.js",
	"./he": "../../../../moment/locale/he.js",
	"./he.js": "../../../../moment/locale/he.js",
	"./hi": "../../../../moment/locale/hi.js",
	"./hi.js": "../../../../moment/locale/hi.js",
	"./hr": "../../../../moment/locale/hr.js",
	"./hr.js": "../../../../moment/locale/hr.js",
	"./hu": "../../../../moment/locale/hu.js",
	"./hu.js": "../../../../moment/locale/hu.js",
	"./hy-am": "../../../../moment/locale/hy-am.js",
	"./hy-am.js": "../../../../moment/locale/hy-am.js",
	"./id": "../../../../moment/locale/id.js",
	"./id.js": "../../../../moment/locale/id.js",
	"./is": "../../../../moment/locale/is.js",
	"./is.js": "../../../../moment/locale/is.js",
	"./it": "../../../../moment/locale/it.js",
	"./it.js": "../../../../moment/locale/it.js",
	"./ja": "../../../../moment/locale/ja.js",
	"./ja.js": "../../../../moment/locale/ja.js",
	"./jv": "../../../../moment/locale/jv.js",
	"./jv.js": "../../../../moment/locale/jv.js",
	"./ka": "../../../../moment/locale/ka.js",
	"./ka.js": "../../../../moment/locale/ka.js",
	"./kk": "../../../../moment/locale/kk.js",
	"./kk.js": "../../../../moment/locale/kk.js",
	"./km": "../../../../moment/locale/km.js",
	"./km.js": "../../../../moment/locale/km.js",
	"./kn": "../../../../moment/locale/kn.js",
	"./kn.js": "../../../../moment/locale/kn.js",
	"./ko": "../../../../moment/locale/ko.js",
	"./ko.js": "../../../../moment/locale/ko.js",
	"./ky": "../../../../moment/locale/ky.js",
	"./ky.js": "../../../../moment/locale/ky.js",
	"./lb": "../../../../moment/locale/lb.js",
	"./lb.js": "../../../../moment/locale/lb.js",
	"./lo": "../../../../moment/locale/lo.js",
	"./lo.js": "../../../../moment/locale/lo.js",
	"./lt": "../../../../moment/locale/lt.js",
	"./lt.js": "../../../../moment/locale/lt.js",
	"./lv": "../../../../moment/locale/lv.js",
	"./lv.js": "../../../../moment/locale/lv.js",
	"./me": "../../../../moment/locale/me.js",
	"./me.js": "../../../../moment/locale/me.js",
	"./mi": "../../../../moment/locale/mi.js",
	"./mi.js": "../../../../moment/locale/mi.js",
	"./mk": "../../../../moment/locale/mk.js",
	"./mk.js": "../../../../moment/locale/mk.js",
	"./ml": "../../../../moment/locale/ml.js",
	"./ml.js": "../../../../moment/locale/ml.js",
	"./mr": "../../../../moment/locale/mr.js",
	"./mr.js": "../../../../moment/locale/mr.js",
	"./ms": "../../../../moment/locale/ms.js",
	"./ms-my": "../../../../moment/locale/ms-my.js",
	"./ms-my.js": "../../../../moment/locale/ms-my.js",
	"./ms.js": "../../../../moment/locale/ms.js",
	"./mt": "../../../../moment/locale/mt.js",
	"./mt.js": "../../../../moment/locale/mt.js",
	"./my": "../../../../moment/locale/my.js",
	"./my.js": "../../../../moment/locale/my.js",
	"./nb": "../../../../moment/locale/nb.js",
	"./nb.js": "../../../../moment/locale/nb.js",
	"./ne": "../../../../moment/locale/ne.js",
	"./ne.js": "../../../../moment/locale/ne.js",
	"./nl": "../../../../moment/locale/nl.js",
	"./nl-be": "../../../../moment/locale/nl-be.js",
	"./nl-be.js": "../../../../moment/locale/nl-be.js",
	"./nl.js": "../../../../moment/locale/nl.js",
	"./nn": "../../../../moment/locale/nn.js",
	"./nn.js": "../../../../moment/locale/nn.js",
	"./pa-in": "../../../../moment/locale/pa-in.js",
	"./pa-in.js": "../../../../moment/locale/pa-in.js",
	"./pl": "../../../../moment/locale/pl.js",
	"./pl.js": "../../../../moment/locale/pl.js",
	"./pt": "../../../../moment/locale/pt.js",
	"./pt-br": "../../../../moment/locale/pt-br.js",
	"./pt-br.js": "../../../../moment/locale/pt-br.js",
	"./pt.js": "../../../../moment/locale/pt.js",
	"./ro": "../../../../moment/locale/ro.js",
	"./ro.js": "../../../../moment/locale/ro.js",
	"./ru": "../../../../moment/locale/ru.js",
	"./ru.js": "../../../../moment/locale/ru.js",
	"./sd": "../../../../moment/locale/sd.js",
	"./sd.js": "../../../../moment/locale/sd.js",
	"./se": "../../../../moment/locale/se.js",
	"./se.js": "../../../../moment/locale/se.js",
	"./si": "../../../../moment/locale/si.js",
	"./si.js": "../../../../moment/locale/si.js",
	"./sk": "../../../../moment/locale/sk.js",
	"./sk.js": "../../../../moment/locale/sk.js",
	"./sl": "../../../../moment/locale/sl.js",
	"./sl.js": "../../../../moment/locale/sl.js",
	"./sq": "../../../../moment/locale/sq.js",
	"./sq.js": "../../../../moment/locale/sq.js",
	"./sr": "../../../../moment/locale/sr.js",
	"./sr-cyrl": "../../../../moment/locale/sr-cyrl.js",
	"./sr-cyrl.js": "../../../../moment/locale/sr-cyrl.js",
	"./sr.js": "../../../../moment/locale/sr.js",
	"./ss": "../../../../moment/locale/ss.js",
	"./ss.js": "../../../../moment/locale/ss.js",
	"./sv": "../../../../moment/locale/sv.js",
	"./sv.js": "../../../../moment/locale/sv.js",
	"./sw": "../../../../moment/locale/sw.js",
	"./sw.js": "../../../../moment/locale/sw.js",
	"./ta": "../../../../moment/locale/ta.js",
	"./ta.js": "../../../../moment/locale/ta.js",
	"./te": "../../../../moment/locale/te.js",
	"./te.js": "../../../../moment/locale/te.js",
	"./tet": "../../../../moment/locale/tet.js",
	"./tet.js": "../../../../moment/locale/tet.js",
	"./tg": "../../../../moment/locale/tg.js",
	"./tg.js": "../../../../moment/locale/tg.js",
	"./th": "../../../../moment/locale/th.js",
	"./th.js": "../../../../moment/locale/th.js",
	"./tl-ph": "../../../../moment/locale/tl-ph.js",
	"./tl-ph.js": "../../../../moment/locale/tl-ph.js",
	"./tlh": "../../../../moment/locale/tlh.js",
	"./tlh.js": "../../../../moment/locale/tlh.js",
	"./tr": "../../../../moment/locale/tr.js",
	"./tr.js": "../../../../moment/locale/tr.js",
	"./tzl": "../../../../moment/locale/tzl.js",
	"./tzl.js": "../../../../moment/locale/tzl.js",
	"./tzm": "../../../../moment/locale/tzm.js",
	"./tzm-latn": "../../../../moment/locale/tzm-latn.js",
	"./tzm-latn.js": "../../../../moment/locale/tzm-latn.js",
	"./tzm.js": "../../../../moment/locale/tzm.js",
	"./ug-cn": "../../../../moment/locale/ug-cn.js",
	"./ug-cn.js": "../../../../moment/locale/ug-cn.js",
	"./uk": "../../../../moment/locale/uk.js",
	"./uk.js": "../../../../moment/locale/uk.js",
	"./ur": "../../../../moment/locale/ur.js",
	"./ur.js": "../../../../moment/locale/ur.js",
	"./uz": "../../../../moment/locale/uz.js",
	"./uz-latn": "../../../../moment/locale/uz-latn.js",
	"./uz-latn.js": "../../../../moment/locale/uz-latn.js",
	"./uz.js": "../../../../moment/locale/uz.js",
	"./vi": "../../../../moment/locale/vi.js",
	"./vi.js": "../../../../moment/locale/vi.js",
	"./x-pseudo": "../../../../moment/locale/x-pseudo.js",
	"./x-pseudo.js": "../../../../moment/locale/x-pseudo.js",
	"./yo": "../../../../moment/locale/yo.js",
	"./yo.js": "../../../../moment/locale/yo.js",
	"./zh-cn": "../../../../moment/locale/zh-cn.js",
	"./zh-cn.js": "../../../../moment/locale/zh-cn.js",
	"./zh-hk": "../../../../moment/locale/zh-hk.js",
	"./zh-hk.js": "../../../../moment/locale/zh-hk.js",
	"./zh-tw": "../../../../moment/locale/zh-tw.js",
	"./zh-tw.js": "../../../../moment/locale/zh-tw.js"
};
function webpackContext(req) {
	return __webpack_require__(webpackContextResolve(req));
};
function webpackContextResolve(req) {
	var id = map[req];
	if(!(id + 1)) // check for number or string
		throw new Error("Cannot find module '" + req + "'.");
	return id;
};
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = "../../../../moment/locale recursive ^\\.\\/.*$";

/***/ }),

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__("../../../../../src/main.ts");


/***/ })

},[0]);
//# sourceMappingURL=main.bundle.js.map