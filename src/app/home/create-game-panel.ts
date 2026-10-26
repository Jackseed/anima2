import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { I18n } from '../core/i18n.service';
import { MatchService, MAX_GAME_NAME_LENGTH } from '../core/match.service';
import { ToastService } from '../core/toast.service';
import { Panel } from '../shared/panel';

@Component({
  selector: 'app-create-game-panel',
  imports: [FormsModule, MatIcon, Panel],
  template: `
    <app-panel (closed)="closed.emit()" [closeLabel]="t().common.close">
      <form class="form" (ngSubmit)="create()">
        <section class="text-box">
          <h2>{{ t().lobby.gameName }}</h2>
        </section>
        <input name="name" [(ngModel)]="name" [maxlength]="maxName" required />
        <button type="submit" class="icon-button validate-button" [disabled]="!name.trim() || busy()">
          <mat-icon [svgIcon]="name.trim() && !busy() ? 'validate' : 'validate-disable'" />
        </button>
      </form>
    </app-panel>
  `,
  styles: `
    .form {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4vh;
      width: 100%;
    }
  `,
})
export class CreateGamePanel {
  protected readonly t = inject(I18n).t;
  private readonly matches = inject(MatchService);
  private readonly toast = inject(ToastService);
  readonly closed = output<void>();
  readonly created = output<string>();

  protected readonly maxName = MAX_GAME_NAME_LENGTH;
  protected readonly busy = signal(false);
  protected name = '';

  protected async create(): Promise<void> {
    if (!this.name.trim()) return;
    this.busy.set(true);
    try {
      this.created.emit(await this.matches.create(this.name));
    } catch {
      this.toast.show(this.t().errors.network);
    } finally {
      this.busy.set(false);
    }
  }
}
