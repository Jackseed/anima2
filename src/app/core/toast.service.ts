import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  text: string;
}

// Orange pill messages, as the snackbars of the 1.x app.
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly current = signal<Toast | null>(null);
  private nextId = 1;
  private timer: ReturnType<typeof setTimeout> | undefined;

  show(text: string, duration = 2500): void {
    clearTimeout(this.timer);
    const toast = { id: this.nextId++, text };
    this.current.set(toast);
    this.timer = setTimeout(() => {
      if (this.current()?.id === toast.id) this.current.set(null);
    }, duration);
  }
}
