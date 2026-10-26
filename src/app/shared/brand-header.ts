import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-brand-header',
  imports: [MatIcon],
  template: `<h1>Anima</h1><mat-icon svgIcon="adaptation" aria-hidden="true" />`,
  styles: `
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      padding-top: calc(var(--safe-top) + 6vh);
    }
    .mat-icon {
      width: calc(3rem + 6vmin);
      height: calc(3rem + 6vmin);
    }
  `,
})
export class BrandHeader {}
