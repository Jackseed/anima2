(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["main"],{

/***/ 0:
/*!***************************!*\
  !*** multi ./src/main.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! /Users/vincent/Documents/anima2/src/main.ts */"zUnb");


/***/ }),

/***/ "8IgT":
/*!*********************************************!*\
  !*** ./src/app/auth/_state/user.service.ts ***!
  \*********************************************/
/*! exports provided: UserService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UserService", function() { return UserService; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "mrSG");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var akita_ng_fire__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! akita-ng-fire */ "rtta");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var _user_model__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./user.model */ "oO6D");
/* harmony import */ var _user_store__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./user.store */ "bsaV");
/* harmony import */ var _angular_fire_auth__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/fire/auth */ "UbJi");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/router */ "tyNb");









let UserService = class UserService extends akita_ng_fire__WEBPACK_IMPORTED_MODULE_2__["CollectionService"] {
    constructor(store, afAuth, router) {
        super(store);
        this.afAuth = afAuth;
        this.router = router;
    }
    anonymousLogin() {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            yield this.afAuth.signInAnonymously();
            const user = yield this.afAuth.authState.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["first"])()).toPromise();
            if (user) {
                this.setUser(user.uid);
            }
            this.router.navigate(['/home']);
        });
    }
    setUser(id) {
        const user = Object(_user_model__WEBPACK_IMPORTED_MODULE_4__["createUser"])({ id });
        this.db.collection(this.currentPath).doc(id).set(user);
    }
};
UserService.ɵfac = function UserService_Factory(t) { return new (t || UserService)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](_user_store__WEBPACK_IMPORTED_MODULE_5__["UserStore"]), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](_angular_fire_auth__WEBPACK_IMPORTED_MODULE_6__["AngularFireAuth"]), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](_angular_router__WEBPACK_IMPORTED_MODULE_7__["Router"])); };
UserService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({ token: UserService, factory: UserService.ɵfac, providedIn: 'root' });
UserService = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"])([
    Object(akita_ng_fire__WEBPACK_IMPORTED_MODULE_2__["CollectionConfig"])({ path: 'users' })
], UserService);

/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵsetClassMetadata"](UserService, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"],
        args: [{ providedIn: 'root' }]
    }], function () { return [{ type: _user_store__WEBPACK_IMPORTED_MODULE_5__["UserStore"] }, { type: _angular_fire_auth__WEBPACK_IMPORTED_MODULE_6__["AngularFireAuth"] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_7__["Router"] }]; }, null); })();


/***/ }),

/***/ "AytR":
/*!*****************************************!*\
  !*** ./src/environments/environment.ts ***!
  \*****************************************/
/*! exports provided: environment */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "environment", function() { return environment; });
const environment = {
    production: false,
    firebase: {
        apiKey: 'AIzaSyBaG7KhkupOxiJ5pF15ahECIW2NYQtx8vo',
        authDomain: 'anima-f51c8.firebaseapp.com',
        projectId: 'anima-f51c8',
        storageBucket: 'anima-f51c8.appspot.com',
        messagingSenderId: '967539986622',
    },
};


/***/ }),

/***/ "Eq5z":
/*!***************************************!*\
  !*** ./src/app/games/games.module.ts ***!
  \***************************************/
/*! exports provided: GamesModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GamesModule", function() { return GamesModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common */ "ofXK");
/* harmony import */ var _homepage_homepage_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./homepage/homepage.component */ "jeuc");




class GamesModule {
}
GamesModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineNgModule"]({ type: GamesModule });
GamesModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjector"]({ factory: function GamesModule_Factory(t) { return new (t || GamesModule)(); }, imports: [[
            _angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"]
        ]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsetNgModuleScope"](GamesModule, { declarations: [_homepage_homepage_component__WEBPACK_IMPORTED_MODULE_2__["HomepageComponent"]], imports: [_angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"]] }); })();
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](GamesModule, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"],
        args: [{
                declarations: [_homepage_homepage_component__WEBPACK_IMPORTED_MODULE_2__["HomepageComponent"]],
                imports: [
                    _angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"]
                ]
            }]
    }], null, null); })();


/***/ }),

/***/ "FV5q":
/*!*********************************************!*\
  !*** ./src/app/board/tiles/tiles.module.ts ***!
  \*********************************************/
/*! exports provided: TilesModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TilesModule", function() { return TilesModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common */ "ofXK");



class TilesModule {
}
TilesModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineNgModule"]({ type: TilesModule });
TilesModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjector"]({ factory: function TilesModule_Factory(t) { return new (t || TilesModule)(); }, imports: [[_angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"]]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsetNgModuleScope"](TilesModule, { imports: [_angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"]] }); })();
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](TilesModule, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"],
        args: [{
                declarations: [],
                imports: [_angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"]],
            }]
    }], null, null); })();


/***/ }),

/***/ "HNW9":
/*!***************************************!*\
  !*** ./src/app/games/_state/index.ts ***!
  \***************************************/
/*! exports provided: cols, lines, max, createGame, GameQuery, GameService, GameStore */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _game_model__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./game.model */ "wWDE");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "cols", function() { return _game_model__WEBPACK_IMPORTED_MODULE_0__["cols"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "lines", function() { return _game_model__WEBPACK_IMPORTED_MODULE_0__["lines"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "max", function() { return _game_model__WEBPACK_IMPORTED_MODULE_0__["max"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "createGame", function() { return _game_model__WEBPACK_IMPORTED_MODULE_0__["createGame"]; });

/* harmony import */ var _game_query__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./game.query */ "Oe1+");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "GameQuery", function() { return _game_query__WEBPACK_IMPORTED_MODULE_1__["GameQuery"]; });

/* harmony import */ var _game_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./game.service */ "VjZP");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "GameService", function() { return _game_service__WEBPACK_IMPORTED_MODULE_2__["GameService"]; });

/* harmony import */ var _game_store__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./game.store */ "pQ5O");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "GameStore", function() { return _game_store__WEBPACK_IMPORTED_MODULE_3__["GameStore"]; });







/***/ }),

/***/ "Ilv1":
/*!***************************************************!*\
  !*** ./src/app/games/guards/active-game.guard.ts ***!
  \***************************************************/
/*! exports provided: ActiveGameGuard */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ActiveGameGuard", function() { return ActiveGameGuard; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "mrSG");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var akita_ng_fire__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! akita-ng-fire */ "rtta");
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../_state */ "HNW9");





let ActiveGameGuard = class ActiveGameGuard extends akita_ng_fire__WEBPACK_IMPORTED_MODULE_2__["CollectionGuard"] {
    constructor(service) {
        super(service);
    }
    // Sync and set active
    sync(next) {
        return this.service.syncActive({ id: next.params.id });
    }
};
ActiveGameGuard.ɵfac = function ActiveGameGuard_Factory(t) { return new (t || ActiveGameGuard)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](_state__WEBPACK_IMPORTED_MODULE_3__["GameService"])); };
ActiveGameGuard.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({ token: ActiveGameGuard, factory: ActiveGameGuard.ɵfac, providedIn: 'root' });
ActiveGameGuard = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"])([
    Object(akita_ng_fire__WEBPACK_IMPORTED_MODULE_2__["CollectionGuardConfig"])({ awaitSync: true })
], ActiveGameGuard);

/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵsetClassMetadata"](ActiveGameGuard, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"],
        args: [{ providedIn: 'root' }]
    }], function () { return [{ type: _state__WEBPACK_IMPORTED_MODULE_3__["GameService"] }]; }, null); })();


/***/ }),

/***/ "Llpa":
/*!****************************************************!*\
  !*** ./src/app/board/tiles/_state/tile.service.ts ***!
  \****************************************************/
/*! exports provided: TileService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TileService", function() { return TileService; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "mrSG");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var akita_ng_fire__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! akita-ng-fire */ "rtta");
/* harmony import */ var src_app_games_state__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! src/app/games/_state */ "HNW9");
/* harmony import */ var _tile_model__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./tile.model */ "pqjz");
/* harmony import */ var _tile_store__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./tile.store */ "MIAQ");








let TileService = class TileService extends akita_ng_fire__WEBPACK_IMPORTED_MODULE_2__["CollectionService"] {
    constructor(store, gameQuery) {
        super(store);
        this.gameQuery = gameQuery;
    }
    setTiles() {
        const tiles = [];
        const game = this.gameQuery.getActive();
        if (game) {
            for (let i = 0; i < src_app_games_state__WEBPACK_IMPORTED_MODULE_3__["cols"]; i++) {
                for (let j = 0; j < src_app_games_state__WEBPACK_IMPORTED_MODULE_3__["cols"]; j++) {
                    const tileId = j + src_app_games_state__WEBPACK_IMPORTED_MODULE_3__["cols"] * i;
                    if (tileId < src_app_games_state__WEBPACK_IMPORTED_MODULE_3__["max"]) {
                        let type = 'blank';
                        if (_tile_model__WEBPACK_IMPORTED_MODULE_4__["islandIds"].includes(tileId))
                            type = 'island';
                        if (_tile_model__WEBPACK_IMPORTED_MODULE_4__["mountainsIds"].includes(tileId))
                            type = 'mountains';
                        if (_tile_model__WEBPACK_IMPORTED_MODULE_4__["rockiesIds"].includes(tileId))
                            type = 'rockies';
                        if (_tile_model__WEBPACK_IMPORTED_MODULE_4__["plainsIds"].includes(tileId))
                            type = 'plains';
                        if (_tile_model__WEBPACK_IMPORTED_MODULE_4__["swampsIds"].includes(tileId))
                            type = 'swamps';
                        if (_tile_model__WEBPACK_IMPORTED_MODULE_4__["forestIds"].includes(tileId))
                            type = 'forest';
                        const tile = Object(_tile_model__WEBPACK_IMPORTED_MODULE_4__["createTile"])(tileId, j, i, type);
                        console.log(tile);
                        tiles.push(tile);
                    }
                }
            }
            this.store.set(tiles);
        }
    }
};
TileService.ɵfac = function TileService_Factory(t) { return new (t || TileService)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](_tile_store__WEBPACK_IMPORTED_MODULE_5__["TileStore"]), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](src_app_games_state__WEBPACK_IMPORTED_MODULE_3__["GameQuery"])); };
TileService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({ token: TileService, factory: TileService.ɵfac, providedIn: 'root' });
TileService = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"])([
    Object(akita_ng_fire__WEBPACK_IMPORTED_MODULE_2__["CollectionConfig"])({ path: 'tiles' })
], TileService);

/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵsetClassMetadata"](TileService, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"],
        args: [{ providedIn: 'root' }]
    }], function () { return [{ type: _tile_store__WEBPACK_IMPORTED_MODULE_5__["TileStore"] }, { type: src_app_games_state__WEBPACK_IMPORTED_MODULE_3__["GameQuery"] }]; }, null); })();


/***/ }),

/***/ "MIAQ":
/*!**************************************************!*\
  !*** ./src/app/board/tiles/_state/tile.store.ts ***!
  \**************************************************/
/*! exports provided: TileStore */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TileStore", function() { return TileStore; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "mrSG");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _datorama_akita__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @datorama/akita */ "4ZtF");




let TileStore = class TileStore extends _datorama_akita__WEBPACK_IMPORTED_MODULE_2__["EntityStore"] {
    constructor() {
        super();
    }
};
TileStore.ɵfac = function TileStore_Factory(t) { return new (t || TileStore)(); };
TileStore.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({ token: TileStore, factory: TileStore.ɵfac, providedIn: 'root' });
TileStore = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"])([
    Object(_datorama_akita__WEBPACK_IMPORTED_MODULE_2__["StoreConfig"])({ name: 'tile' })
], TileStore);

/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵsetClassMetadata"](TileStore, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"],
        args: [{ providedIn: 'root' }]
    }], function () { return []; }, null); })();


/***/ }),

/***/ "Oe1+":
/*!********************************************!*\
  !*** ./src/app/games/_state/game.query.ts ***!
  \********************************************/
/*! exports provided: GameQuery */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GameQuery", function() { return GameQuery; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _datorama_akita__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @datorama/akita */ "4ZtF");
/* harmony import */ var _game_store__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./game.store */ "pQ5O");




class GameQuery extends _datorama_akita__WEBPACK_IMPORTED_MODULE_1__["QueryEntity"] {
    constructor(store) {
        super(store);
        this.store = store;
    }
}
GameQuery.ɵfac = function GameQuery_Factory(t) { return new (t || GameQuery)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_game_store__WEBPACK_IMPORTED_MODULE_2__["GameStore"])); };
GameQuery.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjectable"]({ token: GameQuery, factory: GameQuery.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](GameQuery, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"],
        args: [{ providedIn: 'root' }]
    }], function () { return [{ type: _game_store__WEBPACK_IMPORTED_MODULE_2__["GameStore"] }]; }, null); })();


/***/ }),

/***/ "PJfI":
/*!**************************************!*\
  !*** ./src/app/auth/_state/index.ts ***!
  \**************************************/
/*! exports provided: createUser, UserQuery, UserService, UserStore */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _user_model__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./user.model */ "oO6D");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "createUser", function() { return _user_model__WEBPACK_IMPORTED_MODULE_0__["createUser"]; });

/* harmony import */ var _user_query__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./user.query */ "tJJt");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "UserQuery", function() { return _user_query__WEBPACK_IMPORTED_MODULE_1__["UserQuery"]; });

/* harmony import */ var _user_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./user.service */ "8IgT");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "UserService", function() { return _user_service__WEBPACK_IMPORTED_MODULE_2__["UserService"]; });

/* harmony import */ var _user_store__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./user.store */ "bsaV");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "UserStore", function() { return _user_store__WEBPACK_IMPORTED_MODULE_3__["UserStore"]; });







/***/ }),

/***/ "Pwa4":
/*!**************************************************!*\
  !*** ./src/app/board/tiles/_state/tile.query.ts ***!
  \**************************************************/
/*! exports provided: TileQuery */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TileQuery", function() { return TileQuery; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _datorama_akita__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @datorama/akita */ "4ZtF");
/* harmony import */ var _tile_store__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./tile.store */ "MIAQ");




class TileQuery extends _datorama_akita__WEBPACK_IMPORTED_MODULE_1__["QueryEntity"] {
    constructor(store) {
        super(store);
        this.store = store;
    }
}
TileQuery.ɵfac = function TileQuery_Factory(t) { return new (t || TileQuery)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_tile_store__WEBPACK_IMPORTED_MODULE_2__["TileStore"])); };
TileQuery.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjectable"]({ token: TileQuery, factory: TileQuery.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](TileQuery, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"],
        args: [{ providedIn: 'root' }]
    }], function () { return [{ type: _tile_store__WEBPACK_IMPORTED_MODULE_2__["TileStore"] }]; }, null); })();


/***/ }),

/***/ "Sy1n":
/*!**********************************!*\
  !*** ./src/app/app.component.ts ***!
  \**********************************/
/*! exports provided: AppComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppComponent", function() { return AppComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "tyNb");



class AppComponent {
    constructor() {
        this.title = 'anima2';
    }
}
AppComponent.ɵfac = function AppComponent_Factory(t) { return new (t || AppComponent)(); };
AppComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: AppComponent, selectors: [["app-root"]], decls: 1, vars: 0, template: function AppComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](0, "router-outlet");
    } }, directives: [_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterOutlet"]], styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL2FwcC5jb21wb25lbnQuc2NzcyJ9 */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](AppComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-root',
                templateUrl: './app.component.html',
                styleUrls: ['./app.component.scss']
            }]
    }], null, null); })();


/***/ }),

/***/ "U9TS":
/*!*********************************************!*\
  !*** ./src/app/board/tiles/_state/index.ts ***!
  \*********************************************/
/*! exports provided: islandCoordinates, islandIds, mountainsCoordinates, mountainsIds, rockiesCoordinates, rockiesIds, plainsCoordinates, plainsIds, swampsCoordinates, swampsIds, forestCoordinates, forestIds, createTile, TileQuery, TileService, TileStore */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _tile_model__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./tile.model */ "pqjz");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "islandCoordinates", function() { return _tile_model__WEBPACK_IMPORTED_MODULE_0__["islandCoordinates"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "islandIds", function() { return _tile_model__WEBPACK_IMPORTED_MODULE_0__["islandIds"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "mountainsCoordinates", function() { return _tile_model__WEBPACK_IMPORTED_MODULE_0__["mountainsCoordinates"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "mountainsIds", function() { return _tile_model__WEBPACK_IMPORTED_MODULE_0__["mountainsIds"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "rockiesCoordinates", function() { return _tile_model__WEBPACK_IMPORTED_MODULE_0__["rockiesCoordinates"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "rockiesIds", function() { return _tile_model__WEBPACK_IMPORTED_MODULE_0__["rockiesIds"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "plainsCoordinates", function() { return _tile_model__WEBPACK_IMPORTED_MODULE_0__["plainsCoordinates"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "plainsIds", function() { return _tile_model__WEBPACK_IMPORTED_MODULE_0__["plainsIds"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "swampsCoordinates", function() { return _tile_model__WEBPACK_IMPORTED_MODULE_0__["swampsCoordinates"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "swampsIds", function() { return _tile_model__WEBPACK_IMPORTED_MODULE_0__["swampsIds"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "forestCoordinates", function() { return _tile_model__WEBPACK_IMPORTED_MODULE_0__["forestCoordinates"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "forestIds", function() { return _tile_model__WEBPACK_IMPORTED_MODULE_0__["forestIds"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "createTile", function() { return _tile_model__WEBPACK_IMPORTED_MODULE_0__["createTile"]; });

/* harmony import */ var _tile_query__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./tile.query */ "Pwa4");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TileQuery", function() { return _tile_query__WEBPACK_IMPORTED_MODULE_1__["TileQuery"]; });

/* harmony import */ var _tile_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./tile.service */ "Llpa");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TileService", function() { return _tile_service__WEBPACK_IMPORTED_MODULE_2__["TileService"]; });

/* harmony import */ var _tile_store__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./tile.store */ "MIAQ");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TileStore", function() { return _tile_store__WEBPACK_IMPORTED_MODULE_3__["TileStore"]; });







/***/ }),

/***/ "VjZP":
/*!**********************************************!*\
  !*** ./src/app/games/_state/game.service.ts ***!
  \**********************************************/
/*! exports provided: GameService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GameService", function() { return GameService; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "mrSG");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var akita_ng_fire__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! akita-ng-fire */ "rtta");
/* harmony import */ var _game_model__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./game.model */ "wWDE");
/* harmony import */ var _game_store__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./game.store */ "pQ5O");






let GameService = class GameService extends akita_ng_fire__WEBPACK_IMPORTED_MODULE_2__["CollectionService"] {
    constructor(store) {
        super(store);
    }
    createNewGame(name) {
        const id = this.db.createId();
        const game = Object(_game_model__WEBPACK_IMPORTED_MODULE_3__["createGame"])({ id, name });
        // Create the game
        this.collection.doc(id).set(game);
        return id;
    }
};
GameService.ɵfac = function GameService_Factory(t) { return new (t || GameService)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](_game_store__WEBPACK_IMPORTED_MODULE_4__["GameStore"])); };
GameService.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({ token: GameService, factory: GameService.ɵfac, providedIn: 'root' });
GameService = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"])([
    Object(akita_ng_fire__WEBPACK_IMPORTED_MODULE_2__["CollectionConfig"])({ path: 'games' })
], GameService);

/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵsetClassMetadata"](GameService, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"],
        args: [{ providedIn: 'root' }]
    }], function () { return [{ type: _game_store__WEBPACK_IMPORTED_MODULE_4__["GameStore"] }]; }, null); })();


/***/ }),

/***/ "YNM5":
/*!*********************************************!*\
  !*** ./src/app/games/guards/games.guard.ts ***!
  \*********************************************/
/*! exports provided: GameGuard */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GameGuard", function() { return GameGuard; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var akita_ng_fire__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! akita-ng-fire */ "rtta");
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../_state */ "HNW9");




class GameGuard extends akita_ng_fire__WEBPACK_IMPORTED_MODULE_1__["CollectionGuard"] {
    constructor(service) {
        super(service);
    }
}
GameGuard.ɵfac = function GameGuard_Factory(t) { return new (t || GameGuard)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_state__WEBPACK_IMPORTED_MODULE_2__["GameService"])); };
GameGuard.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjectable"]({ token: GameGuard, factory: GameGuard.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](GameGuard, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"],
        args: [{ providedIn: 'root' }]
    }], function () { return [{ type: _state__WEBPACK_IMPORTED_MODULE_2__["GameService"] }]; }, null); })();


/***/ }),

/***/ "Yj9t":
/*!*************************************!*\
  !*** ./src/app/auth/auth.module.ts ***!
  \*************************************/
/*! exports provided: AuthModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AuthModule", function() { return AuthModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common */ "ofXK");
/* harmony import */ var _login_login_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./login/login.component */ "bsvf");




class AuthModule {
}
AuthModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineNgModule"]({ type: AuthModule });
AuthModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjector"]({ factory: function AuthModule_Factory(t) { return new (t || AuthModule)(); }, imports: [[_angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"]]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsetNgModuleScope"](AuthModule, { declarations: [_login_login_component__WEBPACK_IMPORTED_MODULE_2__["LoginComponent"]], imports: [_angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"]] }); })();
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](AuthModule, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"],
        args: [{
                declarations: [_login_login_component__WEBPACK_IMPORTED_MODULE_2__["LoginComponent"]],
                imports: [_angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"]],
            }]
    }], null, null); })();


/***/ }),

/***/ "ZAI4":
/*!*******************************!*\
  !*** ./src/app/app.module.ts ***!
  \*******************************/
/*! exports provided: AppModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppModule", function() { return AppModule; });
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/platform-browser */ "jhN1");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _app_routing_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app-routing.module */ "vY5A");
/* harmony import */ var _app_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app.component */ "Sy1n");
/* harmony import */ var _angular_flex_layout__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/flex-layout */ "YUcS");
/* harmony import */ var _datorama_akita_ngdevtools__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @datorama/akita-ngdevtools */ "ZWwf");
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../environments/environment */ "AytR");
/* harmony import */ var _angular_fire__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/fire */ "spgP");
/* harmony import */ var _angular_fire_firestore__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/fire/firestore */ "I/3d");
/* harmony import */ var _datorama_akita_ng_router_store__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @datorama/akita-ng-router-store */ "Dxt5");
/* harmony import */ var _games_games_module__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./games/games.module */ "Eq5z");
/* harmony import */ var _board_tiles_tiles_module__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./board/tiles/tiles.module */ "FV5q");
/* harmony import */ var _auth_auth_module__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./auth/auth.module */ "Yj9t");
/* harmony import */ var _board_board_module__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./board/board.module */ "pax7");
/* harmony import */ var _games_guards_games_guard__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./games/guards/games.guard */ "YNM5");
/* harmony import */ var _games_guards_active_game_guard__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./games/guards/active-game.guard */ "Ilv1");
/* harmony import */ var _auth_guards_active_user_guard__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./auth/guards/active-user.guard */ "j9H5");
/* harmony import */ var _angular_fire_auth_guard__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! @angular/fire/auth-guard */ "HTFn");





















class AppModule {
}
AppModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineNgModule"]({ type: AppModule, bootstrap: [_app_component__WEBPACK_IMPORTED_MODULE_3__["AppComponent"]] });
AppModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjector"]({ factory: function AppModule_Factory(t) { return new (t || AppModule)(); }, providers: [
        _angular_fire_auth_guard__WEBPACK_IMPORTED_MODULE_17__["AngularFireAuthGuard"],
        _auth_guards_active_user_guard__WEBPACK_IMPORTED_MODULE_16__["ActiveUserGuard"],
        _games_guards_games_guard__WEBPACK_IMPORTED_MODULE_14__["GameGuard"],
        _games_guards_active_game_guard__WEBPACK_IMPORTED_MODULE_15__["ActiveGameGuard"],
    ], imports: [[
            _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["BrowserModule"],
            _app_routing_module__WEBPACK_IMPORTED_MODULE_2__["AppRoutingModule"],
            _angular_flex_layout__WEBPACK_IMPORTED_MODULE_4__["FlexLayoutModule"],
            _datorama_akita_ng_router_store__WEBPACK_IMPORTED_MODULE_9__["AkitaNgRouterStoreModule"],
            _angular_fire_firestore__WEBPACK_IMPORTED_MODULE_8__["AngularFirestoreModule"],
            _games_games_module__WEBPACK_IMPORTED_MODULE_10__["GamesModule"],
            _board_tiles_tiles_module__WEBPACK_IMPORTED_MODULE_11__["TilesModule"],
            _auth_auth_module__WEBPACK_IMPORTED_MODULE_12__["AuthModule"],
            _board_board_module__WEBPACK_IMPORTED_MODULE_13__["BoardModule"],
            _angular_fire__WEBPACK_IMPORTED_MODULE_7__["AngularFireModule"].initializeApp(_environments_environment__WEBPACK_IMPORTED_MODULE_6__["environment"].firebase),
            _environments_environment__WEBPACK_IMPORTED_MODULE_6__["environment"].production ? [] : _datorama_akita_ngdevtools__WEBPACK_IMPORTED_MODULE_5__["AkitaNgDevtools"].forRoot(),
        ]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵsetNgModuleScope"](AppModule, { declarations: [_app_component__WEBPACK_IMPORTED_MODULE_3__["AppComponent"]], imports: [_angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["BrowserModule"],
        _app_routing_module__WEBPACK_IMPORTED_MODULE_2__["AppRoutingModule"],
        _angular_flex_layout__WEBPACK_IMPORTED_MODULE_4__["FlexLayoutModule"],
        _datorama_akita_ng_router_store__WEBPACK_IMPORTED_MODULE_9__["AkitaNgRouterStoreModule"],
        _angular_fire_firestore__WEBPACK_IMPORTED_MODULE_8__["AngularFirestoreModule"],
        _games_games_module__WEBPACK_IMPORTED_MODULE_10__["GamesModule"],
        _board_tiles_tiles_module__WEBPACK_IMPORTED_MODULE_11__["TilesModule"],
        _auth_auth_module__WEBPACK_IMPORTED_MODULE_12__["AuthModule"],
        _board_board_module__WEBPACK_IMPORTED_MODULE_13__["BoardModule"], _angular_fire__WEBPACK_IMPORTED_MODULE_7__["AngularFireModule"], _datorama_akita_ngdevtools__WEBPACK_IMPORTED_MODULE_5__["AkitaNgDevtools"]] }); })();
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵsetClassMetadata"](AppModule, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"],
        args: [{
                declarations: [_app_component__WEBPACK_IMPORTED_MODULE_3__["AppComponent"]],
                imports: [
                    _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["BrowserModule"],
                    _app_routing_module__WEBPACK_IMPORTED_MODULE_2__["AppRoutingModule"],
                    _angular_flex_layout__WEBPACK_IMPORTED_MODULE_4__["FlexLayoutModule"],
                    _datorama_akita_ng_router_store__WEBPACK_IMPORTED_MODULE_9__["AkitaNgRouterStoreModule"],
                    _angular_fire_firestore__WEBPACK_IMPORTED_MODULE_8__["AngularFirestoreModule"],
                    _games_games_module__WEBPACK_IMPORTED_MODULE_10__["GamesModule"],
                    _board_tiles_tiles_module__WEBPACK_IMPORTED_MODULE_11__["TilesModule"],
                    _auth_auth_module__WEBPACK_IMPORTED_MODULE_12__["AuthModule"],
                    _board_board_module__WEBPACK_IMPORTED_MODULE_13__["BoardModule"],
                    _angular_fire__WEBPACK_IMPORTED_MODULE_7__["AngularFireModule"].initializeApp(_environments_environment__WEBPACK_IMPORTED_MODULE_6__["environment"].firebase),
                    _environments_environment__WEBPACK_IMPORTED_MODULE_6__["environment"].production ? [] : _datorama_akita_ngdevtools__WEBPACK_IMPORTED_MODULE_5__["AkitaNgDevtools"].forRoot(),
                ],
                providers: [
                    _angular_fire_auth_guard__WEBPACK_IMPORTED_MODULE_17__["AngularFireAuthGuard"],
                    _auth_guards_active_user_guard__WEBPACK_IMPORTED_MODULE_16__["ActiveUserGuard"],
                    _games_guards_games_guard__WEBPACK_IMPORTED_MODULE_14__["GameGuard"],
                    _games_guards_active_game_guard__WEBPACK_IMPORTED_MODULE_15__["ActiveGameGuard"],
                ],
                bootstrap: [_app_component__WEBPACK_IMPORTED_MODULE_3__["AppComponent"]],
            }]
    }], null, null); })();


/***/ }),

/***/ "bsaV":
/*!*******************************************!*\
  !*** ./src/app/auth/_state/user.store.ts ***!
  \*******************************************/
/*! exports provided: UserStore */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UserStore", function() { return UserStore; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "mrSG");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _datorama_akita__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @datorama/akita */ "4ZtF");




let UserStore = class UserStore extends _datorama_akita__WEBPACK_IMPORTED_MODULE_2__["EntityStore"] {
    constructor() {
        super();
    }
};
UserStore.ɵfac = function UserStore_Factory(t) { return new (t || UserStore)(); };
UserStore.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({ token: UserStore, factory: UserStore.ɵfac, providedIn: 'root' });
UserStore = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"])([
    Object(_datorama_akita__WEBPACK_IMPORTED_MODULE_2__["StoreConfig"])({ name: 'user' })
], UserStore);

/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵsetClassMetadata"](UserStore, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"],
        args: [{ providedIn: 'root' }]
    }], function () { return []; }, null); })();


/***/ }),

/***/ "bsvf":
/*!***********************************************!*\
  !*** ./src/app/auth/login/login.component.ts ***!
  \***********************************************/
/*! exports provided: LoginComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LoginComponent", function() { return LoginComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "mrSG");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _state_user_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../_state/user.service */ "8IgT");




class LoginComponent {
    constructor(service) {
        this.service = service;
    }
    ngOnInit() { }
    logIn() {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            yield this.service.anonymousLogin();
        });
    }
}
LoginComponent.ɵfac = function LoginComponent_Factory(t) { return new (t || LoginComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](_state_user_service__WEBPACK_IMPORTED_MODULE_2__["UserService"])); };
LoginComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineComponent"]({ type: LoginComponent, selectors: [["app-login"]], decls: 6, vars: 0, consts: [["fxLayout", "column", "fxFill", "", "fxLayoutAlign", "center center"], ["mat-button", "", "color", "warn", 3, "click"]], template: function LoginComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](1, "h1");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](2, "ANIMA");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](3, "button", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function LoginComponent_Template_button_click_3_listener() { return ctx.logIn(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](4, "span");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](5, "Enter");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    } }, styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL2F1dGgvbG9naW4vbG9naW4uY29tcG9uZW50LnNjc3MifQ== */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵsetClassMetadata"](LoginComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"],
        args: [{
                selector: 'app-login',
                templateUrl: './login.component.html',
                styleUrls: ['./login.component.scss'],
            }]
    }], function () { return [{ type: _state_user_service__WEBPACK_IMPORTED_MODULE_2__["UserService"] }]; }, null); })();


/***/ }),

/***/ "gO1n":
/*!**********************************************************!*\
  !*** ./src/app/board/board-view/board-view.component.ts ***!
  \**********************************************************/
/*! exports provided: BoardViewComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BoardViewComponent", function() { return BoardViewComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _tiles_state__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../tiles/_state */ "U9TS");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common */ "ofXK");




const _c0 = function (a0, a1, a2, a3, a4, a5, a6) { return { blank: a0, island: a1, mountains: a2, rockies: a3, plains: a4, swamps: a5, forest: a6 }; };
function BoardViewComponent_div_2_Template(rf, ctx) { if (rf & 1) {
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelement"](0, "div", 3);
} if (rf & 2) {
    const tile_r1 = ctx.$implicit;
    _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngClass", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpureFunction7"](1, _c0, tile_r1.type === "blank", tile_r1.type === "island", tile_r1.type === "mountains", tile_r1.type === "rockies", tile_r1.type === "plains", tile_r1.type === "swamps", tile_r1.type === "forest"));
} }
class BoardViewComponent {
    constructor(tileQuery, tileService) {
        this.tileQuery = tileQuery;
        this.tileService = tileService;
    }
    ngOnInit() {
        this.tileService.setTiles();
        this.tiles$ = this.tileQuery.selectAll();
    }
}
BoardViewComponent.ɵfac = function BoardViewComponent_Factory(t) { return new (t || BoardViewComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_tiles_state__WEBPACK_IMPORTED_MODULE_1__["TileQuery"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_tiles_state__WEBPACK_IMPORTED_MODULE_1__["TileService"])); };
BoardViewComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: BoardViewComponent, selectors: [["app-board-view"]], decls: 4, vars: 3, consts: [[1, "main"], [1, "container"], [3, "ngClass", 4, "ngFor", "ngForOf"], [3, "ngClass"]], template: function BoardViewComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "div", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "div", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtemplate"](2, BoardViewComponent_div_2_Template, 1, 9, "div", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipe"](3, "async");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵproperty"]("ngForOf", _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵpipeBind1"](3, 1, ctx.tiles$));
    } }, directives: [_angular_common__WEBPACK_IMPORTED_MODULE_2__["NgForOf"], _angular_common__WEBPACK_IMPORTED_MODULE_2__["NgClass"]], pipes: [_angular_common__WEBPACK_IMPORTED_MODULE_2__["AsyncPipe"]], styles: [".main[_ngcontent-%COMP%] {\n  --s: 7.4vw;\n  \n  --m: 0.3vw;\n  \n  --r: calc(var(--s) * 3 * 1.1547 / 2 + 4 * var(--m) - 2px);\n  display: flex;\n}\n\n.container[_ngcontent-%COMP%] {\n  font-size: 0;\n  \n}\n\n.container[_ngcontent-%COMP%]   div[_ngcontent-%COMP%] {\n  width: var(--s);\n  height: calc(var(--s) * 1.1547);\n  margin: var(--m);\n  display: inline-block;\n  -webkit-clip-path: polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%);\n          clip-path: polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%);\n  margin-bottom: calc(var(--m) - var(--s) * 0.2885);\n  transition: all 150ms ease-in-out;\n}\n\n.container[_ngcontent-%COMP%]::before {\n  content: \"\";\n  width: calc(var(--s) / 2 + var(--m));\n  float: left;\n  height: 100%;\n  shape-outside: repeating-linear-gradient(transparent 0 calc(var(--r) - 1px), #fff 0 var(--r));\n}\n\n.container[_ngcontent-%COMP%]   div[_ngcontent-%COMP%]:hover {\n  background: #f58787;\n  cursor: pointer;\n}\n\n.blank[_ngcontent-%COMP%] {\n  background: #ffffff;\n}\n\n.blank[_ngcontent-%COMP%]:hover {\n  background: #ffffff !important;\n  cursor: auto !important;\n}\n\n.island[_ngcontent-%COMP%] {\n  background: #d9e6f6;\n}\n\n.rockies[_ngcontent-%COMP%] {\n  background: #fcefdd;\n}\n\n.mountains[_ngcontent-%COMP%] {\n  background: #f9d1c3;\n}\n\n.forest[_ngcontent-%COMP%] {\n  background: #d5e4e0;\n}\n\n.swamps[_ngcontent-%COMP%] {\n  background: #eee0ef;\n}\n\n.plains[_ngcontent-%COMP%] {\n  background: #f8ebcd;\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvYm9hcmQvYm9hcmQtdmlldy9ib2FyZC12aWV3LmNvbXBvbmVudC5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0UsVUFBQTtFQUFZLHNCQUFBO0VBQ1osVUFBQTtFQUFZLCtCQUFBO0VBQ1oseURBQUE7RUFDQSxhQUFBO0FBR0Y7O0FBQUE7RUFDRSxZQUFBO0VBQWMsb0RBQUE7QUFJaEI7O0FBRkE7RUFDRSxlQUFBO0VBQ0EsK0JBQUE7RUFDQSxnQkFBQTtFQUNBLHFCQUFBO0VBQ0EsZ0ZBQUE7VUFBQSx3RUFBQTtFQUNBLGlEQUFBO0VBQ0EsaUNBQUE7QUFLRjs7QUFIQTtFQUNFLFdBQUE7RUFDQSxvQ0FBQTtFQUNBLFdBQUE7RUFDQSxZQUFBO0VBQ0EsNkZBQUE7QUFNRjs7QUFBQTtFQUNFLG1CQUFBO0VBQ0EsZUFBQTtBQUdGOztBQURBO0VBQ0UsbUJBQUE7QUFJRjs7QUFGQTtFQUNFLDhCQUFBO0VBQ0EsdUJBQUE7QUFLRjs7QUFIQTtFQUNFLG1CQUFBO0FBTUY7O0FBSkE7RUFDRSxtQkFBQTtBQU9GOztBQUxBO0VBQ0UsbUJBQUE7QUFRRjs7QUFOQTtFQUNFLG1CQUFBO0FBU0Y7O0FBUEE7RUFDRSxtQkFBQTtBQVVGOztBQVJBO0VBQ0UsbUJBQUE7QUFXRiIsImZpbGUiOiJzcmMvYXBwL2JvYXJkL2JvYXJkLXZpZXcvYm9hcmQtdmlldy5jb21wb25lbnQuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIi5tYWluIHtcbiAgLS1zOiA3LjR2dzsgLyogc2l6ZSBvZiBhIGhleGFnb24gKi9cbiAgLS1tOiAwLjN2dzsgLyogc3BhY2UgYmV0d2VlbiBlYWNoIGhlYXhnb24gKi9cbiAgLS1yOiBjYWxjKHZhcigtLXMpICogMyAqIDEuMTU0NyAvIDIgKyA0ICogdmFyKC0tbSkgLSAycHgpO1xuICBkaXNwbGF5OiBmbGV4O1xufVxuXG4uY29udGFpbmVyIHtcbiAgZm9udC1zaXplOiAwOyAvKmRpc2FibGUgd2hpdGUgc3BhY2UgYmV0d2VlbiBpbmxpbmUgYmxvY2sgZWxlbWVudCAqL1xufVxuLmNvbnRhaW5lciBkaXYge1xuICB3aWR0aDogdmFyKC0tcyk7XG4gIGhlaWdodDogY2FsYyh2YXIoLS1zKSAqIDEuMTU0Nyk7XG4gIG1hcmdpbjogdmFyKC0tbSk7XG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgY2xpcC1wYXRoOiBwb2x5Z29uKDAlIDI1JSwgMCUgNzUlLCA1MCUgMTAwJSwgMTAwJSA3NSUsIDEwMCUgMjUlLCA1MCUgMCUpO1xuICBtYXJnaW4tYm90dG9tOiBjYWxjKHZhcigtLW0pIC0gdmFyKC0tcykgKiAwLjI4ODUpO1xuICB0cmFuc2l0aW9uOiBhbGwgMTUwbXMgZWFzZS1pbi1vdXQ7XG59XG4uY29udGFpbmVyOjpiZWZvcmUge1xuICBjb250ZW50OiBcIlwiO1xuICB3aWR0aDogY2FsYyh2YXIoLS1zKSAvIDIgKyB2YXIoLS1tKSk7XG4gIGZsb2F0OiBsZWZ0O1xuICBoZWlnaHQ6IDEwMCU7XG4gIHNoYXBlLW91dHNpZGU6IHJlcGVhdGluZy1saW5lYXItZ3JhZGllbnQoXG4gICAgdHJhbnNwYXJlbnQgMCBjYWxjKHZhcigtLXIpIC0gMXB4KSxcbiAgICAjZmZmIDAgdmFyKC0tcilcbiAgKTtcbn1cblxuLmNvbnRhaW5lciBkaXY6aG92ZXIge1xuICBiYWNrZ3JvdW5kOiAjZjU4Nzg3O1xuICBjdXJzb3I6IHBvaW50ZXI7XG59XG4uYmxhbmsge1xuICBiYWNrZ3JvdW5kOiAjZmZmZmZmO1xufVxuLmJsYW5rOmhvdmVyIHtcbiAgYmFja2dyb3VuZDogI2ZmZmZmZiAhaW1wb3J0YW50O1xuICBjdXJzb3I6IGF1dG8gIWltcG9ydGFudDtcbn1cbi5pc2xhbmQge1xuICBiYWNrZ3JvdW5kOiAjZDllNmY2O1xufVxuLnJvY2tpZXMge1xuICBiYWNrZ3JvdW5kOiAjZmNlZmRkO1xufVxuLm1vdW50YWlucyB7XG4gIGJhY2tncm91bmQ6ICNmOWQxYzM7XG59XG4uZm9yZXN0IHtcbiAgYmFja2dyb3VuZDogI2Q1ZTRlMDtcbn1cbi5zd2FtcHMge1xuICBiYWNrZ3JvdW5kOiAjZWVlMGVmO1xufVxuLnBsYWlucyB7XG4gIGJhY2tncm91bmQ6ICNmOGViY2Q7XG59XG4iXX0= */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](BoardViewComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-board-view',
                templateUrl: './board-view.component.html',
                styleUrls: ['./board-view.component.scss'],
            }]
    }], function () { return [{ type: _tiles_state__WEBPACK_IMPORTED_MODULE_1__["TileQuery"] }, { type: _tiles_state__WEBPACK_IMPORTED_MODULE_1__["TileService"] }]; }, null); })();


/***/ }),

/***/ "j9H5":
/*!**************************************************!*\
  !*** ./src/app/auth/guards/active-user.guard.ts ***!
  \**************************************************/
/*! exports provided: ActiveUserGuard */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ActiveUserGuard", function() { return ActiveUserGuard; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "mrSG");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var akita_ng_fire__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! akita-ng-fire */ "rtta");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../_state */ "PJfI");
/* harmony import */ var _angular_fire_auth__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/fire/auth */ "UbJi");







let ActiveUserGuard = class ActiveUserGuard extends akita_ng_fire__WEBPACK_IMPORTED_MODULE_2__["CollectionGuard"] {
    constructor(service, store, afAuth) {
        super(service);
        this.store = store;
        this.afAuth = afAuth;
    }
    sync() {
        return this.afAuth.user.pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["tap"])((user) => this.store.setActive(user.uid)), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["switchMap"])((_) => this.service.syncCollection()));
    }
};
ActiveUserGuard.ɵfac = function ActiveUserGuard_Factory(t) { return new (t || ActiveUserGuard)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](_state__WEBPACK_IMPORTED_MODULE_4__["UserService"]), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](_state__WEBPACK_IMPORTED_MODULE_4__["UserStore"]), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵinject"](_angular_fire_auth__WEBPACK_IMPORTED_MODULE_5__["AngularFireAuth"])); };
ActiveUserGuard.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({ token: ActiveUserGuard, factory: ActiveUserGuard.ɵfac, providedIn: 'root' });
ActiveUserGuard = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"])([
    Object(akita_ng_fire__WEBPACK_IMPORTED_MODULE_2__["CollectionGuardConfig"])({ awaitSync: true })
], ActiveUserGuard);

/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵsetClassMetadata"](ActiveUserGuard, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"],
        args: [{ providedIn: 'root' }]
    }], function () { return [{ type: _state__WEBPACK_IMPORTED_MODULE_4__["UserService"] }, { type: _state__WEBPACK_IMPORTED_MODULE_4__["UserStore"] }, { type: _angular_fire_auth__WEBPACK_IMPORTED_MODULE_5__["AngularFireAuth"] }]; }, null); })();


/***/ }),

/***/ "jeuc":
/*!******************************************************!*\
  !*** ./src/app/games/homepage/homepage.component.ts ***!
  \******************************************************/
/*! exports provided: HomepageComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HomepageComponent", function() { return HomepageComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "mrSG");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _state_game_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../_state/game.service */ "VjZP");





class HomepageComponent {
    constructor(router, gameService) {
        this.router = router;
        this.gameService = gameService;
    }
    ngOnInit() { }
    playNow() {
        return Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"])(this, void 0, void 0, function* () {
            const gameId = this.gameService.createNewGame('');
            this.router.navigate([`/games/${gameId}`]);
        });
    }
}
HomepageComponent.ɵfac = function HomepageComponent_Factory(t) { return new (t || HomepageComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"]), _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdirectiveInject"](_state_game_service__WEBPACK_IMPORTED_MODULE_3__["GameService"])); };
HomepageComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineComponent"]({ type: HomepageComponent, selectors: [["app-homepage"]], decls: 2, vars: 0, consts: [[3, "click"]], template: function HomepageComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementStart"](0, "button", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵlistener"]("click", function HomepageComponent_Template_button_click_0_listener() { return ctx.playNow(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵtext"](1, "Play");
        _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵelementEnd"]();
    } }, styles: ["\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL2dhbWVzL2hvbWVwYWdlL2hvbWVwYWdlLmNvbXBvbmVudC5zY3NzIn0= */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵsetClassMetadata"](HomepageComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"],
        args: [{
                selector: 'app-homepage',
                templateUrl: './homepage.component.html',
                styleUrls: ['./homepage.component.scss'],
            }]
    }], function () { return [{ type: _angular_router__WEBPACK_IMPORTED_MODULE_2__["Router"] }, { type: _state_game_service__WEBPACK_IMPORTED_MODULE_3__["GameService"] }]; }, null); })();


/***/ }),

/***/ "oO6D":
/*!*******************************************!*\
  !*** ./src/app/auth/_state/user.model.ts ***!
  \*******************************************/
/*! exports provided: createUser */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createUser", function() { return createUser; });
function createUser(params) {
    return {
        id: params.id,
        gamePlayed: [],
        matchPlayed: 0,
        matchWon: 0,
    };
}


/***/ }),

/***/ "pQ5O":
/*!********************************************!*\
  !*** ./src/app/games/_state/game.store.ts ***!
  \********************************************/
/*! exports provided: GameStore */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GameStore", function() { return GameStore; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "mrSG");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _datorama_akita__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @datorama/akita */ "4ZtF");




let GameStore = class GameStore extends _datorama_akita__WEBPACK_IMPORTED_MODULE_2__["EntityStore"] {
    constructor() {
        super();
    }
};
GameStore.ɵfac = function GameStore_Factory(t) { return new (t || GameStore)(); };
GameStore.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjectable"]({ token: GameStore, factory: GameStore.ɵfac, providedIn: 'root' });
GameStore = Object(tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"])([
    Object(_datorama_akita__WEBPACK_IMPORTED_MODULE_2__["StoreConfig"])({ name: 'game' })
], GameStore);

/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵsetClassMetadata"](GameStore, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"],
        args: [{ providedIn: 'root' }]
    }], function () { return []; }, null); })();


/***/ }),

/***/ "pax7":
/*!***************************************!*\
  !*** ./src/app/board/board.module.ts ***!
  \***************************************/
/*! exports provided: BoardModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BoardModule", function() { return BoardModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common */ "ofXK");
/* harmony import */ var _board_view_board_view_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./board-view/board-view.component */ "gO1n");




class BoardModule {
}
BoardModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineNgModule"]({ type: BoardModule });
BoardModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjector"]({ factory: function BoardModule_Factory(t) { return new (t || BoardModule)(); }, imports: [[_angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"]]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsetNgModuleScope"](BoardModule, { declarations: [_board_view_board_view_component__WEBPACK_IMPORTED_MODULE_2__["BoardViewComponent"]], imports: [_angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"]] }); })();
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](BoardModule, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"],
        args: [{
                declarations: [_board_view_board_view_component__WEBPACK_IMPORTED_MODULE_2__["BoardViewComponent"]],
                imports: [_angular_common__WEBPACK_IMPORTED_MODULE_1__["CommonModule"]],
            }]
    }], null, null); })();


/***/ }),

/***/ "pqjz":
/*!**************************************************!*\
  !*** ./src/app/board/tiles/_state/tile.model.ts ***!
  \**************************************************/
/*! exports provided: islandCoordinates, islandIds, mountainsCoordinates, mountainsIds, rockiesCoordinates, rockiesIds, plainsCoordinates, plainsIds, swampsCoordinates, swampsIds, forestCoordinates, forestIds, createTile */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "islandCoordinates", function() { return islandCoordinates; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "islandIds", function() { return islandIds; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mountainsCoordinates", function() { return mountainsCoordinates; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mountainsIds", function() { return mountainsIds; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rockiesCoordinates", function() { return rockiesCoordinates; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rockiesIds", function() { return rockiesIds; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "plainsCoordinates", function() { return plainsCoordinates; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "plainsIds", function() { return plainsIds; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "swampsCoordinates", function() { return swampsCoordinates; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "swampsIds", function() { return swampsIds; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "forestCoordinates", function() { return forestCoordinates; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "forestIds", function() { return forestIds; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createTile", function() { return createTile; });
/* harmony import */ var src_app_games_state__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! src/app/games/_state */ "HNW9");

const islandCoordinates = [
    [8, 2],
    [7, 3],
    [8, 3],
];
const islandIds = islandCoordinates.map((coordinates) => coordinates[0] + coordinates[1] * src_app_games_state__WEBPACK_IMPORTED_MODULE_0__["cols"]);
const mountainsCoordinates = [
    [5, 5],
    [6, 5],
    [5, 6],
    [6, 6],
    [7, 6],
    [5, 7],
    [6, 7],
];
const mountainsIds = mountainsCoordinates.map((coordinates) => coordinates[0] + coordinates[1] * src_app_games_state__WEBPACK_IMPORTED_MODULE_0__["cols"]);
const rockiesCoordinates = [
    [4, 3],
    [5, 3],
    [3, 4],
    [4, 4],
    [6, 4],
    [3, 5],
    [3, 4],
];
const rockiesIds = rockiesCoordinates.map((coordinates) => coordinates[0] + coordinates[1] * src_app_games_state__WEBPACK_IMPORTED_MODULE_0__["cols"]);
const plainsCoordinates = [
    [5, 8],
    [6, 8],
    [7, 8],
    [5, 9],
    [6, 9],
    [7, 9],
    [5, 10],
    [6, 10],
    [7, 10],
];
const plainsIds = plainsCoordinates.map((coordinates) => coordinates[0] + coordinates[1] * src_app_games_state__WEBPACK_IMPORTED_MODULE_0__["cols"]);
const swampsCoordinates = [
    [8, 6],
    [9, 6],
    [7, 7],
    [8, 7],
    [8, 8],
    [9, 8],
];
const swampsIds = swampsCoordinates.map((coordinates) => coordinates[0] + coordinates[1] * src_app_games_state__WEBPACK_IMPORTED_MODULE_0__["cols"]);
const forestCoordinates = [
    [4, 6],
    [2, 7],
    [3, 7],
    [4, 7],
    [2, 8],
    [3, 8],
    [2, 9],
    [3, 9],
];
const forestIds = forestCoordinates.map((coordinates) => coordinates[0] + coordinates[1] * src_app_games_state__WEBPACK_IMPORTED_MODULE_0__["cols"]);
function createTile(id, x, y, type, params) {
    return Object.assign({ id,
        x,
        y,
        type }, params);
}


/***/ }),

/***/ "tJJt":
/*!*******************************************!*\
  !*** ./src/app/auth/_state/user.query.ts ***!
  \*******************************************/
/*! exports provided: UserQuery */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UserQuery", function() { return UserQuery; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _datorama_akita__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @datorama/akita */ "4ZtF");
/* harmony import */ var _user_store__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./user.store */ "bsaV");




class UserQuery extends _datorama_akita__WEBPACK_IMPORTED_MODULE_1__["QueryEntity"] {
    constructor(store) {
        super(store);
        this.store = store;
    }
}
UserQuery.ɵfac = function UserQuery_Factory(t) { return new (t || UserQuery)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵinject"](_user_store__WEBPACK_IMPORTED_MODULE_2__["UserStore"])); };
UserQuery.ɵprov = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjectable"]({ token: UserQuery, factory: UserQuery.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](UserQuery, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"],
        args: [{ providedIn: 'root' }]
    }], function () { return [{ type: _user_store__WEBPACK_IMPORTED_MODULE_2__["UserStore"] }]; }, null); })();


/***/ }),

/***/ "vY5A":
/*!***************************************!*\
  !*** ./src/app/app-routing.module.ts ***!
  \***************************************/
/*! exports provided: AppRoutingModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppRoutingModule", function() { return AppRoutingModule; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/router */ "tyNb");
/* harmony import */ var _auth_login_login_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./auth/login/login.component */ "bsvf");
/* harmony import */ var _games_homepage_homepage_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./games/homepage/homepage.component */ "jeuc");
/* harmony import */ var _angular_fire_auth_guard__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/fire/auth-guard */ "HTFn");
/* harmony import */ var _board_board_view_board_view_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./board/board-view/board-view.component */ "gO1n");
/* harmony import */ var _games_guards_games_guard__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./games/guards/games.guard */ "YNM5");
/* harmony import */ var _auth_guards_active_user_guard__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./auth/guards/active-user.guard */ "j9H5");
/* harmony import */ var _games_guards_active_game_guard__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./games/guards/active-game.guard */ "Ilv1");











const redirectUnauthorizedToLogin = () => Object(_angular_fire_auth_guard__WEBPACK_IMPORTED_MODULE_4__["redirectUnauthorizedTo"])(['welcome']);
const routes = [
    {
        path: 'welcome',
        component: _auth_login_login_component__WEBPACK_IMPORTED_MODULE_2__["LoginComponent"],
    },
    {
        path: 'home',
        canActivate: [_angular_fire_auth_guard__WEBPACK_IMPORTED_MODULE_4__["AngularFireAuthGuard"], _games_guards_games_guard__WEBPACK_IMPORTED_MODULE_6__["GameGuard"], _auth_guards_active_user_guard__WEBPACK_IMPORTED_MODULE_7__["ActiveUserGuard"]],
        data: { authGuardPipe: redirectUnauthorizedToLogin },
        component: _games_homepage_homepage_component__WEBPACK_IMPORTED_MODULE_3__["HomepageComponent"],
    },
    {
        path: 'games/:id',
        canActivate: [
            _games_guards_active_game_guard__WEBPACK_IMPORTED_MODULE_8__["ActiveGameGuard"],
            _angular_fire_auth_guard__WEBPACK_IMPORTED_MODULE_4__["AngularFireAuthGuard"],
            _games_guards_games_guard__WEBPACK_IMPORTED_MODULE_6__["GameGuard"],
            _auth_guards_active_user_guard__WEBPACK_IMPORTED_MODULE_7__["ActiveUserGuard"],
        ],
        data: { authGuardPipe: redirectUnauthorizedToLogin },
        component: _board_board_view_board_view_component__WEBPACK_IMPORTED_MODULE_5__["BoardViewComponent"],
    },
    {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full',
    },
    {
        path: '**',
        redirectTo: '/home',
        pathMatch: 'full',
    },
];
class AppRoutingModule {
}
AppRoutingModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineNgModule"]({ type: AppRoutingModule });
AppRoutingModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineInjector"]({ factory: function AppRoutingModule_Factory(t) { return new (t || AppRoutingModule)(); }, imports: [[_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"].forRoot(routes)], _angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵsetNgModuleScope"](AppRoutingModule, { imports: [_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"]], exports: [_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"]] }); })();
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](AppRoutingModule, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["NgModule"],
        args: [{
                imports: [_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"].forRoot(routes)],
                exports: [_angular_router__WEBPACK_IMPORTED_MODULE_1__["RouterModule"]],
            }]
    }], null, null); })();


/***/ }),

/***/ "wWDE":
/*!********************************************!*\
  !*** ./src/app/games/_state/game.model.ts ***!
  \********************************************/
/*! exports provided: cols, lines, max, createGame */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cols", function() { return cols; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "lines", function() { return lines; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "max", function() { return max; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createGame", function() { return createGame; });
const cols = 12;
const lines = 13;
const max = cols * lines;
function createGame(params = {}) {
    return Object.assign({ id: params.id, name: params.name }, params);
}


/***/ }),

/***/ "zUnb":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./environments/environment */ "AytR");
/* harmony import */ var _app_app_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app/app.module */ "ZAI4");
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/platform-browser */ "jhN1");




if (_environments_environment__WEBPACK_IMPORTED_MODULE_1__["environment"].production) {
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["enableProdMode"])();
}
_angular_platform_browser__WEBPACK_IMPORTED_MODULE_3__["platformBrowser"]().bootstrapModule(_app_app_module__WEBPACK_IMPORTED_MODULE_2__["AppModule"])
    .catch(err => console.error(err));


/***/ }),

/***/ "zn8P":
/*!******************************************************!*\
  !*** ./$$_lazy_route_resource lazy namespace object ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncaught exception popping up in devtools
	return Promise.resolve().then(function() {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = "zn8P";

/***/ })

},[[0,"runtime","vendor"]]]);
//# sourceMappingURL=main.js.map