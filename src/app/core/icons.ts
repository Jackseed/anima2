import { inject, provideAppInitializer } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ABILITY_IDS } from '@anima/engine';

// SVG icons are inlined by mat-icon, so their CSS variables (colors, active state) can be styled.
const ICONS: Record<string, string> = {
  dot: 'others/dot.svg',
  hourglass: 'menu-buttons/hourglass.svg',
  'hourglass-button': 'menu-buttons/hourglass-button.svg',
  'hourglass-disabled': 'menu-buttons/hourglass-disabled.svg',
  validate: 'menu-buttons/validate-button.svg',
  'validate-disable': 'menu-buttons/validate-disable-button.svg',
  close: 'menu-buttons/close-button.svg',
  'close-blur': 'menu-buttons/close-blur-button.svg',
  'species-circle': 'menu-buttons/species-circle.svg',
  'score-button': 'menu-buttons/score-button.svg',
  action: 'menu-buttons/action.svg',
  'menu-button': 'menu-buttons/menu-button.svg',
  'question-mark': 'menu-buttons/question-mark.svg',
  'anima-blur': 'others/anima-blur.svg',
  'anima-empty': 'others/anima-empty.svg',
  star: 'others/star.svg',
  baby: 'others/baby.svg',
  hex: 'species-hex.svg',
  migration: 'action-buttons/migrate.svg',
  'migration-disable': 'action-buttons/migrate-disable.svg',
  'migration-active': 'action-buttons/migrate-active.svg',
  assimilation: 'action-buttons/assimilate.svg',
  'assimilation-disable': 'action-buttons/assimilate-disable.svg',
  'assimilation-active': 'action-buttons/assimilate-active.svg',
  proliferation: 'action-buttons/proliferate.svg',
  'proliferation-disable': 'action-buttons/proliferate-disable.svg',
  'proliferation-active': 'action-buttons/proliferate-active.svg',
  adaptation: 'action-buttons/adaptation.svg',
  'adaptation-disable': 'action-buttons/adaptation-disable.svg',
  'adaptation-active': 'action-buttons/adaptation-active.svg',
};
for (const id of ABILITY_IDS) {
  ICONS[id] = `species/${id}.svg`;
  ICONS[`${id}-ability`] = `abilities/${id}.svg`;
}

export function provideIcons() {
  return provideAppInitializer(() => {
    const registry = inject(MatIconRegistry);
    const sanitizer = inject(DomSanitizer);
    for (const [name, path] of Object.entries(ICONS)) {
      registry.addSvgIcon(name, sanitizer.bypassSecurityTrustResourceUrl(`assets/${path}`));
    }
  });
}
