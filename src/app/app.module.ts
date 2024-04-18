// Angular
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// AngularFire
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { SETTINGS as FIRESTORE_EMULATOR } from '@angular/fire/firestore';
import { SETTINGS as AUTH_EMULATOR } from '@angular/fire/auth';

// Akita
import { AkitaNgDevtools } from '@datorama/akita-ngdevtools';
import { AkitaNgRouterStoreModule } from '@datorama/akita-ng-router-store';

// FlexLayout
import { FlexLayoutModule } from '@angular/flex-layout';

// Env
import { environment } from '../environments/environment';

// Modules
import { AppRoutingModule } from './app-routing.module';
import { GamesModule } from './games/games.module';
import { TilesModule } from './board/tiles/tiles.module';
import { AuthModule } from './auth/auth.module';
import { BoardModule } from './board/board.module';

// Guards
import { GameGuard } from './games/guards/games.guard';
import { ActiveGameGuard } from './games/guards/active-game.guard';
import { ActiveUserGuard } from './auth/guards/active-user.guard';
import { AngularFireAuthGuard } from '@angular/fire/auth-guard';

// Components
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';

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
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
  providers: [
    AngularFireAuthGuard,
    ActiveUserGuard,
    GameGuard,
    ActiveGameGuard,
    {
      provide: FIRESTORE_EMULATOR,
      useValue: environment.production
        ? undefined
        : {
            host: 'localhost:8080',
            ssl: false,
          },
    },
    {
      provide: AUTH_EMULATOR,
      useValue: environment.production
        ? undefined
        : {
            host: 'localhost:9099',
            ssl: false,
          },
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
