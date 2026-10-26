import { Component, inject, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, MAX_NAME_LENGTH } from '../core/auth.service';
import { I18n } from '../core/i18n.service';
import { MatchService } from '../core/match.service';
import { ToastService } from '../core/toast.service';
import { authErrorText } from '../shared/auth-errors';
import { Panel } from '../shared/panel';

@Component({
  selector: 'app-account-panel',
  imports: [FormsModule, Panel],
  template: `
    <app-panel [title]="auth.name()" (closed)="closed.emit()">
      <h2 class="subtitle">{{ t().account.played }}</h2>
      <p class="figure">{{ stats()?.played ?? '…' }}</p>
      <h2 class="subtitle">{{ t().account.won }}</h2>
      <p class="figure">{{ stats()?.won ?? '…' }}</p>

      <form class="row" (ngSubmit)="rename()">
        <input name="name" [(ngModel)]="name" [maxlength]="maxName" [attr.aria-label]="t().account.name" />
        <button type="submit" class="nav-button" [disabled]="!name.trim() || name.trim() === auth.name() || busy()">
          <h2>{{ t().account.rename }}</h2>
        </button>
      </form>

      <div class="row">
        <span class="label">{{ t().account.language }}</span>
        <button type="button" class="nav-button" [disabled]="i18n.lang() === 'fr'" (click)="i18n.lang.set('fr')"><h2>FR</h2></button>
        <button type="button" class="nav-button" [disabled]="i18n.lang() === 'en'" (click)="i18n.lang.set('en')"><h2>EN</h2></button>
      </div>

      @if (auth.isAnonymous()) {
        <p class="hint">{{ t().account.saveHint }}</p>
        <form class="column" (ngSubmit)="save()">
          <input name="email" type="email" [(ngModel)]="email" [placeholder]="t().welcome.email" autocomplete="email" />
          <input
            name="password"
            type="password"
            [(ngModel)]="password"
            [placeholder]="t().welcome.password"
            autocomplete="new-password"
          />
          <button type="submit" class="nav-button" [disabled]="!email || password.length < 6 || busy()">
            <h2>{{ t().account.save }}</h2>
          </button>
        </form>
      } @else {
        <p class="hint">{{ t().account.saved(auth.email() ?? '') }}</p>
      }

      @if (confirmDelete()) {
        <p class="hint">{{ t().account.deleteWarning }}</p>
        <div class="row">
          <button type="button" class="nav-button" (click)="confirmDelete.set(false)"><h2>{{ t().common.cancel }}</h2></button>
          <button type="button" class="nav-button danger" [disabled]="busy()" (click)="delete()">
            <h2>{{ t().common.confirm }}</h2>
          </button>
        </div>
      } @else {
        <button type="button" class="nav-button danger" (click)="confirmDelete.set(true)"><h2>{{ t().account.delete }}</h2></button>
      }
    </app-panel>
  `,
  styles: `
    .figure {
      color: #f4bb3a;
      font-weight: 800;
      font-size: calc(1.5rem + 1.5vmin);
      margin: 0;
    }
    .subtitle {
      margin: 0.6rem 0 0;
    }
    .row,
    .column {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-top: 1.25rem;
    }
    .column {
      flex-direction: column;
    }
    .label {
      color: var(--blue-color);
      font-weight: 700;
    }
    .hint {
      font-size: calc(0.85rem + 0.6vmin);
      text-align: center;
      margin: 1.25rem 0 0;
    }
  `,
})
export class AccountPanel implements OnInit {
  protected readonly i18n = inject(I18n);
  protected readonly t = this.i18n.t;
  protected readonly auth = inject(AuthService);
  private readonly matches = inject(MatchService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  readonly closed = output<void>();

  protected readonly maxName = MAX_NAME_LENGTH;
  protected readonly stats = signal<{ played: number; won: number } | null>(null);
  protected readonly busy = signal(false);
  protected readonly confirmDelete = signal(false);
  protected name = this.auth.name();
  protected email = '';
  protected password = '';

  async ngOnInit(): Promise<void> {
    try {
      const [legacy, current] = await Promise.all([this.auth.legacyStats(), this.matches.finishedStats()]);
      this.stats.set({ played: legacy.played + current.played, won: legacy.won + current.won });
    } catch {
      this.stats.set({ played: 0, won: 0 });
    }
  }

  protected rename(): Promise<void> {
    return this.run(() => this.auth.rename(this.name));
  }

  protected save(): Promise<void> {
    return this.run(() => this.auth.saveAccount(this.email, this.password));
  }

  protected delete(): Promise<void> {
    return this.run(async () => {
      await this.auth.deleteAccount();
      await this.router.navigateByUrl('/welcome');
    });
  }

  private async run(action: () => Promise<void>): Promise<void> {
    this.busy.set(true);
    try {
      await action();
    } catch (error) {
      this.toast.show(authErrorText(error, this.t()));
    } finally {
      this.busy.set(false);
    }
  }
}
