import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { HomepageComponent } from './games/homepage/homepage.component';
import {
  AngularFireAuthGuard,
  redirectUnauthorizedTo,
} from '@angular/fire/auth-guard';
import { BoardViewComponent } from './board/board-view/board-view.component';
import { GameGuard } from './games/guards/games.guard';
import { ActiveUserGuard } from './auth/guards/active-user.guard';
import { ActiveGameGuard } from './games/guards/active-game.guard';

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
    component: HomepageComponent,
  },
  {
    path: 'games/:id',
    canActivate: [
      ActiveGameGuard,
      AngularFireAuthGuard,
      GameGuard,
      ActiveUserGuard,
    ],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
    component: BoardViewComponent,
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
