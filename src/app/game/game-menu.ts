import { Component, inject, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { I18n } from '../core/i18n.service';
import { Panel } from '../shared/panel';
import { GameStore } from './game.store';

@Component({
  selector: 'app-game-menu',
  imports: [Panel],
  template: `
    <app-panel (closed)="closed.emit()" [closeLabel]="t().common.close">
      <nav>
        @if (confirmResign()) {
          <p>{{ t().game.resignConfirm }}</p>
          <button type="button" class="nav-button" (click)="confirmResign.set(false)"><h2>{{ t().common.cancel }}</h2></button>
          <button type="button" class="nav-button danger" (click)="resign()"><h2>{{ t().game.resign }}</h2></button>
        } @else {
          <button type="button" class="nav-button" (click)="router.navigateByUrl('/rules')"><h2>{{ t().game.menuRules }}</h2></button>
          <button type="button" class="nav-button" (click)="router.navigateByUrl('/home')"><h2>{{ t().game.menuHome }}</h2></button>
          @if (canResign()) {
            <button type="button" class="nav-button danger" (click)="confirmResign.set(true)"><h2>{{ t().game.resign }}</h2></button>
          }
        }
      </nav>
    </app-panel>
  `,
  styles: `
    nav {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3vh;
      padding: 2vh 0;
    }
    p {
      text-align: center;
    }
  `,
})
export class GameMenu {
  protected readonly t = inject(I18n).t;
  protected readonly router = inject(Router);
  private readonly store = inject(GameStore);
  readonly closed = output<void>();
  protected readonly confirmResign = signal(false);

  protected canResign(): boolean {
    const phase = this.store.phase();
    return phase === 'setup' || phase === 'playing';
  }

  protected async resign(): Promise<void> {
    await this.store.send({ type: 'resign' });
    this.closed.emit();
  }
}
