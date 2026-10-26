import { Component, computed, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { isActiveAbility, type AbilityId, type PlayAction } from '@anima/engine';
import { I18n } from '../core/i18n.service';
import { GameStore, type Mode } from './game.store';

const BASIC_ACTIONS = ['migration', 'assimilation', 'proliferation', 'adaptation'] as const;
const ABILITY_ACTIONS: Partial<Record<AbilityId, PlayAction>> = {
  intimidate: 'intimidation',
  tunnel: 'tunnel',
  rallying: 'rallying',
};

// Basic action buttons, and the active abilities of the playing species above them.
@Component({
  selector: 'app-game-footer',
  imports: [MatIcon],
  template: `
    @if (store.isMyTurn() && activeAbilities().length > 0) {
      <section class="active-bar">
        @for (ability of activeAbilities(); track ability.id) {
          <div class="relative ability-slot">
            <button
              type="button"
              class="icon-button ability-button"
              [class.enabled]="canStart(ability.action)"
              [disabled]="!canStart(ability.action)"
              (click)="store.startAction(ability.action)"
              [attr.aria-label]="t().abilities[ability.id].name"
            >
              <mat-icon [svgIcon]="ability.id + '-ability'" />
            </button>
            @if (store.mode() === ability.action) {
              <button type="button" class="icon-button close-small" (click)="store.stopAction()" [attr.aria-label]="t().common.cancel">
                <mat-icon svgIcon="close" />
              </button>
            }
          </div>
        }
      </section>
    }
    <main>
      <section class="sidebar">
        @if (store.isMyTurn()) {
          @for (action of actions; track action) {
            <article class="relative">
              <button
                type="button"
                class="icon-button action-button"
                [disabled]="!canStart(action)"
                (click)="store.startAction(action)"
                [attr.aria-label]="t().actions[action]"
              >
                <mat-icon [svgIcon]="icon(action)" />
              </button>
              @if (action === 'migration' && canStart(action)) {
                <div class="absolute circle"><div class="figures">{{ store.remainingMigrations() }}</div></div>
              }
              @if (store.mode() === action && canStart(action)) {
                <button type="button" class="icon-button close-small" (click)="store.stopAction()" [attr.aria-label]="t().common.cancel">
                  <mat-icon svgIcon="close-blur" />
                </button>
              }
            </article>
          }
        } @else {
          <div class="dots fill">
            <mat-icon svgIcon="dot" /><mat-icon svgIcon="dot" /><mat-icon svgIcon="dot" />
          </div>
        }
      </section>
      <div class="orange-bar"></div>
    </main>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      position: relative;
    }
    main {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .sidebar {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background-color: rgba(242, 242, 242, 0.6);
      padding: 0 5%;
    }
    article {
      flex: 0 0 22%;
      height: 100%;
    }
    .action-button {
      width: 100%;
      height: 100%;
      padding-top: 8px;
      .mat-icon {
        width: 140%;
        height: 100%;
        flex: none;
      }
    }
    .circle {
      width: 30px;
      height: 30px;
      background-color: var(--anima-color);
      bottom: 20%;
      right: 0;
      border-radius: 50%;
      border: solid white 3px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .figures {
      color: white;
      font-size: calc(1rem + 1vmin);
      font-weight: 600;
      line-height: 1;
    }
    .close-small {
      --s: calc(1.5rem + 2vmin);
      position: absolute;
      width: var(--s);
      height: var(--s);
      top: 50%;
      left: 57%;
      transform: translate(-50%, -50%);
    }
    .dots .mat-icon {
      width: 1.5rem;
      height: 1.5rem;
    }
    .active-bar {
      position: absolute;
      bottom: 100%;
      right: 5%;
      display: flex;
      gap: 4%;
      height: 60%;
      width: 60%;
      justify-content: flex-end;
    }
    .ability-slot {
      height: 100%;
      aspect-ratio: 1;
    }
    .ability-button {
      width: 100%;
      height: 100%;
      --ability-active-display: none;
      color: grey;
      &.enabled {
        color: var(--anima-color);
      }
    }
  `,
})
export class GameFooter {
  protected readonly store = inject(GameStore);
  protected readonly t = inject(I18n).t;
  protected readonly actions = BASIC_ACTIONS;

  protected readonly activeAbilities = computed(() =>
    (this.store.turnSpecies()?.abilityIds ?? [])
      .filter((id) => isActiveAbility(id) && ABILITY_ACTIONS[id])
      .map((id) => ({ id, action: ABILITY_ACTIONS[id]! })),
  );

  protected canStart(action: PlayAction): boolean {
    const mode = this.store.mode();
    return this.store.canStart(action) && (mode === 'idle' || mode === (action as Mode));
  }

  protected icon(action: (typeof BASIC_ACTIONS)[number]): string {
    if (this.store.mode() === action) return `${action}-active`;
    return this.canStart(action) ? action : `${action}-disable`;
  }
}
