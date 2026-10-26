import { Component, computed, inject, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import type { AbilityId } from '@anima/engine';
import { I18n } from '../core/i18n.service';
import { GameStore, type SpeciesListRequest } from './game.store';

// Species of a tile (or of the whole map), with their traits; also used to pick a target.
@Component({
  selector: 'app-species-list',
  imports: [MatIcon],
  template: `
    @if (store.speciesList(); as request) {
      <div class="screen translucent" (click)="close()">
        @if (request.action) {
          <section class="text-box banner"><h2>{{ t().game.chooseSpecies(verb(request)) }}</h2></section>
        }
        <div class="panel-wrapper" (click)="$event.stopPropagation()">
          <button type="button" class="icon-button close-button" (click)="close()" [attr.aria-label]="t().common.close">
            <mat-icon svgIcon="close" />
          </button>
          <main class="list-panel">
            <section class="species-list">
              @for (view of views(); track view.species.id) {
                <article>
                  <div class="species relative">
                    <button
                      type="button"
                      class="icon-button fill"
                      [class.active]="selectedSpeciesId() === view.species.id && !selectedAbilityId()"
                      [style.--primary-color]="view.colors.primary"
                      [style.--secondary-color]="view.colors.secondary"
                      (click)="select(view.species.id, request.action ? null : view.species.abilityIds[0])"
                    >
                      <mat-icon class="fill" svgIcon="hex" />
                      <mat-icon class="species-icon" [svgIcon]="view.species.abilityIds[0] ?? 'question-mark'" />
                    </button>
                    <div class="absolute circle">
                      <div class="figures" [class.small]="view.count >= 100">{{ view.count }}</div>
                    </div>
                  </div>
                  <div class="box orange-icons">
                    @for (ability of view.species.abilityIds; track ability) {
                      <button type="button" class="icon-button ability" (click)="select(view.species.id, ability)">
                        <mat-icon
                          [class.active]="selectedSpeciesId() === view.species.id && selectedAbilityId() === ability"
                          [svgIcon]="ability + '-ability'"
                        />
                      </button>
                    }
                  </div>
                </article>
              }
            </section>
            <aside class="flame-background">
              @if (selectedAbilityId(); as ability) {
                <mat-icon class="title-icon" [svgIcon]="ability + '-ability'" />
                <p class="definition">
                  <strong>{{ t().abilities[ability].name }}</strong><br />{{ t().abilities[ability].definition }}
                </p>
              } @else if (request.action && selectedSpeciesId()) {
                <h3>{{ t().game.confirmSpecies(verb(request)) }}</h3>
                <button type="button" class="icon-button validate-button" (click)="validate()" [attr.aria-label]="t().common.confirm">
                  <mat-icon svgIcon="validate" />
                </button>
              }
            </aside>
          </main>
        </div>
      </div>
    }
  `,
  styles: `
    .banner {
      margin-top: calc(var(--safe-top) + 4vh);
    }
    .list-panel {
      background: white;
      border: 3px var(--anima-color) solid;
      width: min(86vw, 600px);
      height: min(72vh, 720px);
      display: flex;
      flex-direction: column;
    }
    .species-list {
      flex: 0 0 64%;
      overflow-y: auto;
      padding: 2.5rem 5% 1rem;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    article {
      display: flex;
      align-items: center;
      height: calc(4rem + 4vmin);
      flex: none;
    }
    .species {
      height: 100%;
      aspect-ratio: 0.9;
      flex: none;
    }
    .species-icon {
      --species-title-display: none;
      position: absolute;
      height: 70%;
      width: 70%;
      top: 55%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
    }
    .active {
      --ability-active-display: inherit;
      filter: drop-shadow(0 0 8px #ff9100);
    }
    .circle {
      width: 40px;
      height: 40px;
      background-color: var(--anima-color);
      bottom: -5%;
      right: -20%;
      border-radius: 50%;
      border: solid white 3px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .figures {
      color: white;
      font-size: calc(1.2rem + 1vmin);
      font-weight: 600;
      &.small {
        font-size: calc(0.8rem + 0.5vmin);
      }
    }
    .box {
      flex: 1;
      height: 60%;
      margin-left: 8%;
      background-color: #f2f2f2;
      border: 3px var(--anima-color) solid;
      padding-left: 5%;
      display: flex;
      align-items: center;
      gap: 4%;
    }
    .ability {
      --ability-active-display: none;
      width: calc(2rem + 1vmin);
      height: calc(2rem + 1vmin);
    }
    aside {
      flex: 1;
      border-top: 4px var(--anima-color) solid;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      padding-bottom: 1rem;
    }
    .title-icon {
      --ability-active-display: none;
      color: var(--anima-color);
      width: 3rem;
      height: 3rem;
    }
    .validate-button {
      position: absolute;
      bottom: 0;
      transform: translateY(50%);
    }
  `,
})
export class SpeciesList {
  protected readonly store = inject(GameStore);
  protected readonly t = inject(I18n).t;
  protected readonly selectedSpeciesId = signal<string | null>(null);
  protected readonly selectedAbilityId = signal<AbilityId | null>(null);
  protected readonly views = computed(() => {
    const request = this.store.speciesList();
    return request ? this.store.speciesViews(request) : [];
  });

  protected verb(request: SpeciesListRequest): string {
    return request.action === 'assimilate' ? this.t().game.assimilateVerb : this.t().game.intimidateVerb;
  }

  protected select(speciesId: string, abilityId: AbilityId | null | undefined): void {
    this.selectedSpeciesId.set(speciesId);
    this.selectedAbilityId.set(abilityId ?? null);
  }

  protected validate(): void {
    const speciesId = this.selectedSpeciesId();
    this.reset();
    if (speciesId) this.store.chooseTarget(speciesId);
  }

  protected close(): void {
    this.reset();
    this.store.speciesList.set(null);
  }

  private reset(): void {
    this.selectedSpeciesId.set(null);
    this.selectedAbilityId.set(null);
  }
}
