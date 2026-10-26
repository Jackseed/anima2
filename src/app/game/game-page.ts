import { Component, computed, effect, inject, input, signal, untracked, viewChild } from '@angular/core';
import { I18n } from '../core/i18n.service';
import { ToastService } from '../core/toast.service';
import { AbilityMenu } from './ability-menu';
import { actionMessage, playedTiles } from './action-message';
import { Board } from './board';
import { GameFooter } from './game-footer';
import { GameHeader } from './game-header';
import { GameMenu } from './game-menu';
import { GameOverlay } from './game-overlay';
import { GameStore } from './game.store';
import { ScorePanel } from './score-panel';
import { SpeciesList } from './species-list';

@Component({
  selector: 'app-game-page',
  imports: [AbilityMenu, Board, GameFooter, GameHeader, GameMenu, GameOverlay, ScorePanel, SpeciesList],
  providers: [GameStore],
  template: `
    @if (store.match() === null) {
      <div class="screen opaque center">
        <p>{{ t().errors.gameNotFound }}</p>
        <a class="nav-button" href="/home"><h2>{{ t().game.menuHome }}</h2></a>
      </div>
    } @else if (!store.state()) {
      <div class="screen opaque center"><p>{{ t().common.loading }}</p></div>
    } @else {
      @if (showControls()) {
        <header><app-game-header (skipTurn)="skipTurn()" (openScore)="panel.set('score')" (openMenu)="panel.set('menu')" /></header>
      }
      <app-board />
      @if (showControls()) {
        <footer><app-game-footer /></footer>
      }
      <app-game-overlay (openSpeciesList)="store.openSpeciesList(null)" />
      @if (!overlay()?.isAnimating()) {
        <app-ability-menu />
      }
      <app-species-list />
      @switch (panel()) {
        @case ('score') {
          <app-score-panel (closed)="panel.set(null)" />
        }
        @case ('menu') {
          <app-game-menu (closed)="panel.set(null)" />
        }
      }
      @if (store.connectionError()) {
        <div class="offline">{{ t().common.offline }}</div>
      }
    }
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      position: relative;
    }
    header {
      position: fixed;
      top: 0;
      width: 100%;
      height: calc(16% + var(--safe-top));
      z-index: 5;
    }
    footer {
      position: fixed;
      bottom: 0;
      width: 100%;
      height: calc(16% + var(--safe-bottom));
      padding-bottom: var(--safe-bottom);
      z-index: 5;
    }
    .center {
      justify-content: center;
      gap: 2rem;
    }
    a.nav-button {
      text-decoration: none;
    }
    .offline {
      position: fixed;
      top: calc(var(--safe-top) + 0.5rem);
      left: 50%;
      transform: translateX(-50%);
      background: #c0453c;
      color: white;
      padding: 0.3rem 1rem;
      border-radius: 1rem;
      z-index: 50;
      font-weight: 700;
    }
  `,
})
export class GamePage {
  protected readonly store = inject(GameStore);
  protected readonly t = inject(I18n).t;
  private readonly toast = inject(ToastService);
  private readonly overlay = viewChild(GameOverlay);

  readonly id = input.required<string>();
  protected readonly panel = signal<'score' | 'menu' | null>(null);
  protected readonly showControls = computed(() => {
    const phase = this.store.phase();
    return phase !== 'waiting' && !this.overlay()?.hidesBoardControls();
  });

  constructor() {
    effect(() => this.store.matchId.set(this.id()));

    // Tells the player what the opponent just did.
    let lastSeenAction: number | null = null;
    effect(() => {
      const state = this.store.state();
      if (!state) return;
      const entry = state.lastAction;
      if (lastSeenAction === null) {
        lastSeenAction = entry?.id ?? 0;
        return;
      }
      if (!entry || entry.id <= lastSeenAction) return;
      lastSeenAction = entry.id;
      if (entry.playerId === this.store.uid()) return;
      untracked(() => {
        this.toast.show(actionMessage(entry, state, this.t()), 3000);
        this.store.showPlayedTiles(playedTiles(entry));
      });
    });
  }

  protected skipTurn(): void {
    this.store.clearSelection();
    void this.store.send({ type: 'endTurn' });
  }
}
