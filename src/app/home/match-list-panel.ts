import { Component, computed, DestroyRef, inject, input, OnInit, output, signal } from '@angular/core';
import { AuthService } from '../core/auth.service';
import { I18n } from '../core/i18n.service';
import { CommandRejected, MatchService, type MatchDoc } from '../core/match.service';
import { ToastService } from '../core/toast.service';
import { Panel } from '../shared/panel';

// Open games to join, or the games of the player.
@Component({
  selector: 'app-match-list-panel',
  imports: [Panel],
  template: `
    <app-panel [title]="kind() === 'open' ? t().lobby.available : t().lobby.mine" (closed)="closed.emit()">
      @if (matches() === null) {
        <p>{{ t().common.loading }}</p>
      } @else if (matches()!.length === 0) {
        <p>{{ kind() === 'open' ? t().lobby.none : t().lobby.noneMine }}</p>
      } @else {
        <ul>
          @for (match of matches(); track match.id) {
            <li>
              <button type="button" (click)="open(match)" [disabled]="busy()">
                <span class="subtitle">{{ match.name }}</span>
                <span class="status">{{ status(match) }}</span>
              </button>
            </li>
          }
        </ul>
      }
    </app-panel>
  `,
  styles: `
    ul {
      list-style: none;
      padding: 0;
      margin: 0 0 1rem;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    button {
      background: none;
      border: none;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .subtitle {
      position: relative;
      padding: 0 20px;
      &::before,
      &::after {
        content: '';
        position: absolute;
        top: 50%;
        width: 5px;
        height: 5px;
        background-color: #f4bb3a;
        border-radius: 50%;
      }
      &::before {
        left: 0;
      }
      &::after {
        right: 0;
      }
    }
    .status {
      color: grey;
      font-size: calc(0.8rem + 0.8vmin);
    }
  `,
})
export class MatchListPanel implements OnInit {
  protected readonly t = inject(I18n).t;
  private readonly service = inject(MatchService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly kind = input<'open' | 'mine'>('open');
  readonly closed = output<void>();
  readonly opened = output<string>();

  private readonly all = signal<MatchDoc[] | null>(null);
  // A player does not need to see their own open games in the join list.
  protected readonly matches = computed(() => {
    const all = this.all();
    if (!all) return null;
    const uid = this.auth.uid();
    return this.kind() === 'open' ? all.filter((match) => !match.playerIds.includes(uid ?? '')) : all;
  });
  protected readonly busy = signal(false);

  ngOnInit(): void {
    const onError = () => {
      this.all.set([]);
      this.toast.show(this.t().errors.network);
    };
    const unsubscribe =
      this.kind() === 'open'
        ? this.service.watchOpen((matches) => this.all.set(matches), onError)
        : this.service.watchMine((matches) => this.all.set(matches), onError);
    this.destroyRef.onDestroy(unsubscribe);
  }

  protected status(match: MatchDoc): string {
    const lobby = this.t().lobby;
    const uid = this.auth.uid();
    const state = match.state;
    if (this.kind() === 'open') {
      return lobby.versus(state.players[0]?.name ?? '');
    }
    const opponent = state.players.find((player) => player.id !== uid);
    const versus = opponent ? `${lobby.versus(opponent.name)} · ` : '';
    switch (state.phase) {
      case 'waiting':
        return lobby.waiting;
      case 'setup':
        return versus + lobby.setup;
      case 'playing':
        return versus + (state.turn?.playerId === uid ? lobby.yourTurn : lobby.theirTurn);
      case 'finished':
        return versus + (state.winner?.playerId === uid ? lobby.won : lobby.lost);
    }
  }

  protected async open(match: MatchDoc): Promise<void> {
    if (this.kind() === 'mine') {
      this.opened.emit(match.id);
      return;
    }
    this.busy.set(true);
    try {
      await this.service.join(match.id);
      this.opened.emit(match.id);
    } catch (error) {
      const code = error instanceof CommandRejected ? error.code : null;
      const rules = this.t().errors.rules;
      this.toast.show((code && rules[code]) || this.t().errors.generic);
    } finally {
      this.busy.set(false);
    }
  }
}
