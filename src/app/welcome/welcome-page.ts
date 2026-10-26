import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, MAX_NAME_LENGTH } from '../core/auth.service';
import { I18n } from '../core/i18n.service';
import { ToastService } from '../core/toast.service';
import { authErrorText } from '../shared/auth-errors';
import { BrandHeader } from '../shared/brand-header';

@Component({
  selector: 'app-welcome-page',
  imports: [FormsModule, BrandHeader],
  template: `
    <app-brand-header />
    @if (!withAccount()) {
      <form class="form" (ngSubmit)="play()">
        <section class="text-box">
          <h2>{{ t().welcome.nameQuestion }}</h2>
        </section>
        <input name="name" [(ngModel)]="name" [maxlength]="maxName" autocomplete="nickname" required />
        <button type="submit" class="nav-button" [disabled]="!name.trim() || busy()">
          <h2>{{ t().common.play }}</h2>
        </button>
        <button type="button" class="link" (click)="withAccount.set(true)">{{ t().welcome.haveAccount }}</button>
      </form>
    } @else {
      <form class="form" (ngSubmit)="signIn()">
        <input name="email" type="email" [(ngModel)]="email" [placeholder]="t().welcome.email" autocomplete="email" />
        <input
          name="password"
          type="password"
          [(ngModel)]="password"
          [placeholder]="t().welcome.password"
          autocomplete="current-password"
        />
        <button type="submit" class="nav-button" [disabled]="!email || !password || busy()">
          <h2>{{ t().welcome.signIn }}</h2>
        </button>
        <button type="button" class="link" (click)="withAccount.set(false)">{{ t().common.back }}</button>
      </form>
    }
    <div class="lang">
      <button type="button" class="link" [class.current]="i18n.lang() === 'fr'" (click)="i18n.lang.set('fr')">FR</button>
      <button type="button" class="link" [class.current]="i18n.lang() === 'en'" (click)="i18n.lang.set('en')">EN</button>
    </div>
    <div class="orange-bar"></div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
    }
    .form {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6vh;
      width: 100%;
    }
    .link {
      background: none;
      border: none;
      color: var(--blue-color);
      font-weight: 700;
      font-size: calc(0.9rem + 0.8vmin);
      cursor: pointer;
      text-decoration: underline;
    }
    .lang {
      display: flex;
      gap: 1rem;
      padding-bottom: calc(var(--safe-bottom) + 1rem);
      .current {
        color: var(--anima-color);
        text-decoration: none;
      }
    }
  `,
})
export class WelcomePage {
  protected readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly maxName = MAX_NAME_LENGTH;
  protected readonly withAccount = signal(false);
  protected readonly busy = signal(false);
  protected name = '';
  protected email = '';
  protected password = '';

  protected async play(): Promise<void> {
    await this.run(() => this.auth.playAsGuest(this.name));
  }

  protected async signIn(): Promise<void> {
    await this.run(() => this.auth.signInWithEmail(this.email, this.password));
  }

  private async run(action: () => Promise<void>): Promise<void> {
    this.busy.set(true);
    try {
      await action();
      await this.router.navigateByUrl('/home');
    } catch (error) {
      this.toast.show(authErrorText(error, this.t()));
    } finally {
      this.busy.set(false);
    }
  }
}
