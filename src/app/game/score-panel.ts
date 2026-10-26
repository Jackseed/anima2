import { Component, computed, inject, output } from '@angular/core';
import { REGIONS, regionScores } from '@anima/engine';
import { playerColor } from '../core/colors';
import { I18n } from '../core/i18n.service';
import { Panel } from '../shared/panel';
import { GameStore } from './game.store';

@Component({
  selector: 'app-score-panel',
  imports: [Panel],
  template: `
    <app-panel [title]="t().game.scoreBoard" [flame]="false" (closed)="closed.emit()">
      @if (store.state(); as state) {
        <ul class="facts">
          <li>{{ t().game.era(state.era) }} · {{ t().game.round(state.round) }}</li>
          @if (state.turn; as turn) {
            <li>{{ t().game.remainingActions }} : {{ turn.remainingActions }}</li>
            <li>{{ t().game.remainingMigrations }} : {{ store.remainingMigrations() }}</li>
          }
        </ul>
        <table>
          <thead>
            <tr>
              <th></th>
              @for (player of state.players; track player.id) {
                <th [style.color]="color(player.color)">{{ player.name }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (region of regions; track region.id) {
              <tr>
                <td class="region" [style.background]="'var(--' + region.id + '-color)'">
                  {{ t().regions[region.id] }} ({{ region.points }})
                </td>
                @for (row of controlled(); track row.playerId) {
                  <td>{{ row.regions[region.id] ? '✔' : '' }}</td>
                }
              </tr>
            }
            <tr class="total">
              <td>{{ t().game.total }}</td>
              @for (player of state.players; track player.id) {
                <td>{{ t().game.points(player.score) }}</td>
              }
            </tr>
          </tbody>
        </table>
        <p class="goal">{{ t().game.goal }}</p>
      }
    </app-panel>
  `,
  styles: `
    .facts {
      list-style: none;
      padding: 0;
      margin: 0 0 1rem;
      color: var(--blue-color);
      font-weight: 700;
      text-align: center;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      font-weight: 700;
      color: #555;
    }
    th,
    td {
      padding: 0.35rem 0.5rem;
      text-align: center;
    }
    .region {
      text-align: left;
      border-radius: 0.5rem;
    }
    .total td {
      color: var(--anima-color);
      border-top: 2px solid var(--anima-color);
    }
    .goal {
      font-size: calc(0.8rem + 0.5vmin);
      text-align: center;
    }
  `,
})
export class ScorePanel {
  protected readonly store = inject(GameStore);
  protected readonly t = inject(I18n).t;
  protected readonly regions = REGIONS;
  readonly closed = output<void>();

  // Regions each player would score if the era ended now.
  protected readonly controlled = computed(() => {
    const state = this.store.state();
    if (!state) return [];
    return state.players.map((player) => ({ playerId: player.id, regions: regionScores(state, player.id) }));
  });

  protected color(color: 'green' | 'red'): string {
    return playerColor(color);
  }
}
