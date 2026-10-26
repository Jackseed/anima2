import { Component, computed, inject, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { I18n } from '../core/i18n.service';
import { GameStore } from './game.store';

@Component({
  selector: 'app-game-header',
  imports: [MatIcon],
  template: `
    <div class="sidebar">
      <div class="species-section">
        @if (store.turnSpecies(); as species) {
          <button
            type="button"
            class="icon-button species-button"
            [style.--primary-color]="colors()?.primary"
            [style.--secondary-color]="colors()?.secondary"
            (click)="store.openSpeciesList(null)"
            [attr.aria-label]="t().game.speciesList"
          >
            <mat-icon svgIcon="species-circle" />
            <mat-icon class="species-icon" [svgIcon]="species.abilityIds[0] ?? 'question-mark'" />
          </button>
          <div class="small-text-box">
            <div class="abilities">
              @for (ability of species.abilityIds; track ability) {
                <mat-icon class="orange-icons ability" [svgIcon]="ability + '-ability'" />
              }
            </div>
            <div class="actions" [attr.aria-label]="t().game.remainingActions">
              @for (action of remainingActions(); track $index) {
                <mat-icon svgIcon="action" />
              }
            </div>
          </div>
        }
      </div>
      <button
        type="button"
        class="icon-button turn-button"
        [disabled]="!canSkip()"
        (click)="skipTurn.emit()"
        [attr.aria-label]="t().messages.endTurn"
      >
        <mat-icon [svgIcon]="canSkip() ? 'hourglass-button' : 'hourglass-disabled'" />
      </button>
      <button type="button" class="icon-button score-button" (click)="openScore.emit()" [attr.aria-label]="t().game.scoreBoard">
        <mat-icon svgIcon="score-button" />
      </button>
      <button type="button" class="icon-button menu-button" (click)="openMenu.emit()" aria-label="Menu">
        <mat-icon svgIcon="menu-button" />
      </button>
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }
    .sidebar {
      height: 100%;
      display: flex;
      align-items: center;
      gap: 3%;
      background-color: rgba(242, 242, 242, 0.6);
      padding: var(--safe-top) 5% 0;
    }
    .species-section {
      flex: 0 0 55%;
      height: 100%;
      position: relative;
      display: flex;
      align-items: center;
    }
    .species-button {
      --s: calc(4.5rem + 2.5vmin);
      position: absolute;
      left: 0;
      width: var(--s);
      height: var(--s);
      z-index: 1;
      .species-icon {
        --species-title-display: none;
        position: absolute;
        width: calc(var(--s) - 2rem);
        height: calc(var(--s) - 2rem);
        top: 55%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
      }
    }
    .small-text-box {
      background-color: rgba(255, 255, 255, 0.95);
      width: 100%;
      min-height: 30%;
      margin-left: 15%;
      display: flex;
      align-items: stretch;
    }
    .abilities {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding-left: 40%;
      gap: 4%;
      .ability {
        --ability-active-display: none;
        width: calc(1.5rem + 2vmin);
        height: calc(1.5rem + 2vmin);
      }
    }
    .actions {
      flex: 0 0 12%;
      background-color: orange;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: -4% 0;
      padding: 2%;
      .mat-icon {
        width: 100%;
        height: auto;
        min-height: 0.8rem;
      }
    }
    .turn-button,
    .score-button {
      --s: calc(2.5rem + 2.5vmin);
      width: var(--s);
      height: var(--s);
      color: grey;
    }
    .menu-button {
      --s: calc(1.8rem + 2.5vmin);
      width: var(--s);
      height: var(--s);
    }
  `,
})
export class GameHeader {
  protected readonly store = inject(GameStore);
  protected readonly t = inject(I18n).t;
  readonly skipTurn = output<void>();
  readonly openScore = output<void>();
  readonly openMenu = output<void>();

  protected readonly colors = computed(() => {
    const species = this.store.turnSpecies();
    return species ? this.store.colorsOf(species) : null;
  });
  protected readonly remainingActions = computed(() =>
    Array.from({ length: this.store.state()?.turn?.remainingActions ?? 0 }),
  );
  protected readonly canSkip = computed(
    () => this.store.isMyTurn() && !this.store.busy() && !this.store.state()?.turn?.pendingAdaptation,
  );
}
