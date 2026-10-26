import { Component, computed, inject, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { findSpecies, type AbilityId } from '@anima/engine';
import { I18n } from '../core/i18n.service';
import { GameStore } from './game.store';

// Trait choice: for a new species during the placement, or after starting an adaptation.
@Component({
  selector: 'app-ability-menu',
  imports: [MatIcon],
  template: `
    @if (choice(); as current) {
      <div class="screen translucent">
        <header class="text-box">
          <h2>{{ current.isNewSpecies ? t().game.chooseFirstAbility : t().game.chooseNewAbility }}</h2>
        </header>
        <main>
          @for (ability of current.abilityIds; track ability) {
            <article [class.parent-glow]="selected() === ability">
              <button
                type="button"
                class="icon-button ability-button"
                [class.glow]="selected() === ability"
                [style.--primary-color]="current.colors.primary"
                [style.--secondary-color]="current.colors.secondary"
                (click)="selected.set(ability)"
                [attr.aria-label]="t().abilities[ability].name"
              >
                <mat-icon class="fill" svgIcon="hex" />
                <mat-icon class="species-icon" [svgIcon]="ability" />
                <span class="species-name">{{ t().abilities[ability].name }}</span>
              </button>
            </article>
          }
        </main>
        <aside>
          @if (selected(); as ability) {
            <mat-icon class="orange-icons ability" [svgIcon]="ability + '-ability'" />
            <p class="definition">
              <strong>{{ t().abilities[ability].name }}</strong><br />{{ t().abilities[ability].definition }}
            </p>
          }
          <button
            type="button"
            class="icon-button validate-button"
            [disabled]="!selected() || store.busy()"
            (click)="validate(current.isNewSpecies)"
            [attr.aria-label]="t().common.confirm"
          >
            <mat-icon [svgIcon]="selected() ? 'validate' : 'validate-disable'" />
          </button>
        </aside>
        <div class="spacer"></div>
        <div class="orange-bar"></div>
      </div>
    }
  `,
  styles: `
    .screen {
      justify-content: center;
      gap: 2vh;
    }
    header {
      margin-top: 4vh;
    }
    main {
      flex: 0 0 30%;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    article {
      flex: 0 0 45%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .ability-button {
      height: 50%;
      width: 90%;
      position: relative;
      container-type: inline-size;
    }
    .glow {
      filter: drop-shadow(0px 0px 20px #ff9100);
    }
    // Names are shown in HTML, in the player's language, instead of the French titles drawn in the SVGs.
    .species-icon {
      --species-title-display: none;
      height: 50%;
      width: 50%;
      position: absolute;
      top: 45%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
    }
    .species-name {
      position: absolute;
      left: 0;
      right: 0;
      top: 70%;
      color: white;
      font-weight: 800;
      font-size: 10cqw;
      line-height: 1.1;
      text-align: center;
    }
    aside {
      position: relative;
      width: 80%;
      max-width: 600px;
      min-height: 20%;
      background-color: white;
      border: 6px var(--anima-color) solid;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 0.5rem 0 calc(0.5rem + 5vh);
      .definition {
        margin: 0.5rem 0;
      }
    }
    .ability {
      --ability-active-display: none;
      width: 4rem;
      height: 4rem;
    }
    .validate-button {
      position: absolute;
      bottom: 0;
      transform: translateY(50%);
    }
    .spacer {
      flex: 1;
    }
  `,
})
export class AbilityMenu {
  protected readonly store = inject(GameStore);
  protected readonly t = inject(I18n).t;
  protected readonly selected = signal<AbilityId | null>(null);

  protected readonly choice = computed(() => {
    const state = this.store.state();
    if (!state) return null;
    const setup = this.store.mySetup();
    if (setup && setup.abilityId === null) {
      const species = findSpecies(state, setup.speciesId);
      if (!species) return null;
      return { isNewSpecies: true, abilityIds: setup.abilityChoices, colors: this.store.colorsOf(species) };
    }
    const pending = this.store.pendingAdaptation();
    const species = this.store.turnSpecies();
    if (pending && species) {
      return { isNewSpecies: false, abilityIds: pending.abilityChoices, colors: this.store.colorsOf(species) };
    }
    return null;
  });

  protected async validate(isNewSpecies: boolean): Promise<void> {
    const abilityId = this.selected();
    if (!abilityId) return;
    const sent = await this.store.send(isNewSpecies ? { type: 'chooseAbility', abilityId } : { type: 'adapt', abilityId });
    if (sent) this.selected.set(null);
  }
}
