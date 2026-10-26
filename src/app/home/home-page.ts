import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { I18n } from '../core/i18n.service';
import { BrandHeader } from '../shared/brand-header';
import { AccountPanel } from './account-panel';
import { CreateGamePanel } from './create-game-panel';
import { MatchListPanel } from './match-list-panel';

type HomePanel = 'create' | 'join' | 'mine' | 'account' | 'quit' | null;

@Component({
  selector: 'app-home-page',
  imports: [BrandHeader, AccountPanel, CreateGamePanel, MatchListPanel],
  template: `
    <app-brand-header />
    <nav>
      <button type="button" class="nav-button" (click)="panel.set('create')"><h2>{{ t().home.create }}</h2></button>
      <button type="button" class="nav-button" (click)="panel.set('join')"><h2>{{ t().home.join }}</h2></button>
      <button type="button" class="nav-button" (click)="panel.set('mine')"><h2>{{ t().home.resume }}</h2></button>
      <button type="button" class="nav-button" (click)="router.navigateByUrl('/rules')"><h2>{{ t().home.rules }}</h2></button>
      <button type="button" class="nav-button" (click)="panel.set('account')"><h2>{{ t().home.account }}</h2></button>
      <button type="button" class="nav-button" (click)="quit()"><h2>{{ t().home.quit }}</h2></button>
    </nav>
    <div class="orange-bar"></div>

    @switch (panel()) {
      @case ('create') {
        <app-create-game-panel (closed)="panel.set(null)" (created)="openGame($event)" />
      }
      @case ('join') {
        <app-match-list-panel kind="open" (closed)="panel.set(null)" (opened)="openGame($event)" />
      }
      @case ('mine') {
        <app-match-list-panel kind="mine" (closed)="panel.set(null)" (opened)="openGame($event)" />
      }
      @case ('account') {
        <app-account-panel (closed)="panel.set(null)" />
      }
      @case ('quit') {
        <div class="screen translucent" (click)="panel.set(null)">
          <section class="panel" (click)="$event.stopPropagation()">
            <p>{{ t().home.quitWarning }}</p>
            <div class="row">
              <button type="button" class="nav-button" (click)="panel.set(null)"><h2>{{ t().common.cancel }}</h2></button>
              <button type="button" class="nav-button danger" (click)="signOut()"><h2>{{ t().home.quit }}</h2></button>
            </div>
          </section>
        </div>
      }
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
    }
    nav {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-evenly;
      padding: 3vh 0 calc(var(--safe-bottom) + 6vh);
    }
    .row {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }
    p {
      text-align: center;
    }
  `,
})
export class HomePage {
  protected readonly t = inject(I18n).t;
  protected readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  protected readonly panel = signal<HomePanel>(null);

  protected openGame(id: string): void {
    this.panel.set(null);
    void this.router.navigate(['/games', id]);
  }

  protected quit(): void {
    if (this.auth.isAnonymous()) this.panel.set('quit');
    else void this.signOut();
  }

  protected async signOut(): Promise<void> {
    await this.auth.signOut();
    await this.router.navigateByUrl('/welcome');
  }
}
