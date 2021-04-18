import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { FlexLayoutModule } from '@angular/flex-layout';
import { AkitaNgDevtools } from '@datorama/akita-ngdevtools';
import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AkitaNgRouterStoreModule } from '@datorama/akita-ng-router-store';
import { GamesModule } from './games/games.module';
import { TilesModule } from './board/tiles/tiles.module';
import { AuthModule } from './auth/auth.module';
import { BoardModule } from './board/board.module';
import { GameGuard } from './games/guards/games.guard';
import { ActiveGameGuard } from './games/guards/active-game.guard';
import { ActiveUserGuard } from './auth/guards/active-user.guard';
import { AngularFireAuthGuard } from '@angular/fire/auth-guard';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FlexLayoutModule,
    AkitaNgRouterStoreModule,
    AngularFirestoreModule,
    GamesModule,
    TilesModule,
    AuthModule,
    BoardModule,
    AngularFireModule.initializeApp(environment.firebase),
    environment.production ? [] : AkitaNgDevtools.forRoot(),
    BrowserAnimationsModule,
  ],
  providers: [
    AngularFireAuthGuard,
    ActiveUserGuard,
    GameGuard,
    ActiveGameGuard,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
