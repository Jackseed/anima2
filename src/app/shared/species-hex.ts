import { Component, inject, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import type { AbilityId } from '@anima/engine';
import type { Colors } from '../core/colors';
import { I18n } from '../core/i18n.service';

// A species drawn as a colored hexagon with its main trait and its name.
@Component({
  selector: 'app-species-hex',
  imports: [MatIcon],
  template: `
    <mat-icon class="fill" svgIcon="hex" />
    <mat-icon class="species-icon" [svgIcon]="abilityId()" />
    <span class="species-name">{{ t().abilities[abilityId()].name }}</span>
  `,
  host: {
    '[style.--primary-color]': 'colors().primary',
    '[style.--secondary-color]': 'colors().secondary',
  },
  styles: `
    :host {
      position: relative;
      display: block;
      aspect-ratio: 0.9;
      // Names scale with the hexagon, so the longest ones still fit.
      container-type: inline-size;
    }
    .species-icon {
      --species-title-display: none;
      position: absolute;
      width: 55%;
      height: 55%;
      top: 45%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
    }
    .species-name {
      position: absolute;
      left: 0;
      right: 0;
      top: 72%;
      color: white;
      font-weight: 800;
      font-size: 10cqw;
      line-height: 1.1;
      text-align: center;
    }
  `,
})
export class SpeciesHex {
  protected readonly t = inject(I18n).t;
  readonly abilityId = input.required<AbilityId>();
  readonly colors = input.required<Colors>();
}
