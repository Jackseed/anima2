// Angular
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// AngularFire
import {
  AngularFireAuthGuard,
  redirectUnauthorizedTo,
} from '@angular/fire/auth-guard';

// Components
import { LoginComponent } from './auth/login/login.component';
import { HomepageComponent } from './games/homepage/homepage.component';
import { BoardViewComponent } from './board/board-view/board-view.component';

// Guards
import { GameGuard } from './games/guards/games.guard';
import { ActiveUserGuard } from './auth/guards/active-user.guard';
import { ActiveGameGuard } from './games/guards/active-game.guard';
import { SpeciesGuard } from './board/species/guards/species.guard';
import { TilesGuard } from './board/tiles/guards/tiles.guard';
import { PlayerGuard } from './board/players/guards/player.guard';
import { ActivePlayerGuard } from './board/players/guards/active-player.guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['welcome']);

const routes: Routes = [
  {
    path: 'welcome',
    component: LoginComponent,
  },
  {
    path: 'home',
    canActivate: [AngularFireAuthGuard, GameGuard, ActiveUserGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
    canDeactivate: [GameGuard, ActiveUserGuard],
    component: HomepageComponent,
  },
  {
    path: 'games/:id',
    canActivate: [ActiveGameGuard, ActiveUserGuard, AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
    canDeactivate: [ActiveGameGuard, ActiveUserGuard],
    children: [
      {
        path: '',
        canActivate: [SpeciesGuard, TilesGuard, PlayerGuard, ActivePlayerGuard],
        canDeactivate: [
          SpeciesGuard,
          TilesGuard,
          PlayerGuard,
          ActivePlayerGuard,
        ],
        component: BoardViewComponent,
      },
    ],
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

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
