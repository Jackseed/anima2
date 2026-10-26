import { Component, input, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

// Bordered box over a translucent screen, with the round close button on top.
@Component({
  selector: 'app-panel',
  imports: [MatIcon],
  template: `
    <div class="screen translucent" (click)="closed.emit()">
      <div class="panel-wrapper" (click)="$event.stopPropagation()">
        <button type="button" class="icon-button close-button" (click)="closed.emit()" [attr.aria-label]="closeLabel()">
          <mat-icon svgIcon="close" />
        </button>
        <section class="panel" [class.flame-background]="flame()">
          @if (title()) {
            <h2 class="title">{{ title() }}</h2>
          }
          <ng-content />
        </section>
      </div>
    </div>
  `,
  styles: `
    .title {
      color: var(--anima-color);
      font-weight: 600;
      font-size: calc(1.4rem + 1.5vmin);
      text-align: center;
      margin-top: 0;
    }
  `,
})
export class Panel {
  readonly title = input('');
  readonly flame = input(true);
  readonly closeLabel = input('Close');
  readonly closed = output<void>();
}
