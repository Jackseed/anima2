import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const signedInGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const user = await inject(AuthService).whenReady();
  return user ? true : router.parseUrl('/welcome');
};

export const signedOutGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const user = await inject(AuthService).whenReady();
  return user ? router.parseUrl('/home') : true;
};
