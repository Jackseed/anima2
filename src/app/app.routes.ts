import { Routes } from '@angular/router';
import { signedInGuard, signedOutGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: 'welcome',
    canActivate: [signedOutGuard],
    loadComponent: () => import('./welcome/welcome-page').then((m) => m.WelcomePage),
  },
  {
    path: 'home',
    canActivate: [signedInGuard],
    loadComponent: () => import('./home/home-page').then((m) => m.HomePage),
  },
  {
    path: 'rules',
    loadComponent: () => import('./rules/rules-page').then((m) => m.RulesPage),
  },
  {
    path: 'games/:id',
    canActivate: [signedInGuard],
    loadComponent: () => import('./game/game-page').then((m) => m.GamePage),
  },
  { path: '**', redirectTo: 'home' },
];
