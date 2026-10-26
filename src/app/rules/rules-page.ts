import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { ABILITY_IDS, REGIONS } from '@anima/engine';
import { I18n } from '../core/i18n.service';

@Component({
  selector: 'app-rules-page',
  imports: [MatIcon],
  template: `
    <header>
      <button type="button" class="nav-button" (click)="location.back()"><h2>{{ t().common.back }}</h2></button>
      <h1>{{ t().rules.title }}</h1>
    </header>
    <main>
      @for (section of t().rules.sections; track section.title) {
        <h3>{{ section.title }}</h3>
        <p>{{ section.text }}</p>
      }
      <h3>{{ t().rules.regionsTitle }}</h3>
      <ul class="regions">
        @for (region of regions; track region.id) {
          <li [style.background]="'var(--' + region.id + '-color)'">
            {{ t().regions[region.id] }} · {{ t().rules.regionTiles(region.tileIds.length) }} ·
            {{ t().game.points(region.points) }}
          </li>
        }
      </ul>
      <h3>{{ t().rules.abilitiesTitle }}</h3>
      @for (id of abilityIds; track id) {
        <article>
          <mat-icon class="orange-icons" [svgIcon]="id + '-ability'" aria-hidden="true" />
          <div>
            <strong>{{ t().abilities[id].name }}</strong>
            <p>{{ t().abilities[id].definition }}</p>
          </div>
        </article>
      }
    </main>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: calc(var(--safe-top) + 1rem) 1rem 0.5rem;
      h1 {
        font-size: calc(1.5rem + 3vmin);
      }
    }
    main {
      overflow-y: auto;
      padding: 0 1.25rem calc(var(--safe-bottom) + 2rem);
      max-width: 760px;
      user-select: text;
      -webkit-user-select: text;
    }
    h3 {
      margin-top: 1.25rem;
    }
    p {
      color: #444;
      font-weight: 500;
      font-size: calc(0.95rem + 0.4vmin);
    }
    .regions {
      list-style: none;
      padding: 0;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      li {
        padding: 0.4rem 0.8rem;
        border-radius: 1rem;
        font-weight: 700;
        color: #555;
      }
    }
    article {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      .mat-icon {
        flex: none;
        width: 3rem;
        height: 3rem;
      }
      strong {
        color: var(--anima-color);
      }
      p {
        margin-top: 0.2rem;
      }
    }
  `,
})
export class RulesPage {
  protected readonly t = inject(I18n).t;
  protected readonly location = inject(Location);
  protected readonly regions = REGIONS;
  protected readonly abilityIds = ABILITY_IDS;
}
