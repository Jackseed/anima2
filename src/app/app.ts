import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastService } from './core/toast.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <router-outlet />
    @if (toast.current(); as current) {
      <div class="toast" role="status" aria-live="polite">{{ current.text }}</div>
    }
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
    }
    .toast {
      position: fixed;
      z-index: 100;
      left: 50%;
      bottom: calc(22% + var(--safe-bottom));
      transform: translateX(-50%);
      background: var(--anima-color);
      color: white;
      font-weight: 600;
      font-size: calc(1rem + 1vmin);
      text-align: center;
      border-radius: 30px;
      padding: 1rem 1.5rem;
      max-width: 80vw;
      pointer-events: none;
      white-space: pre-line;
    }
  `,
})
export class App {
  protected readonly toast = inject(ToastService);
}
