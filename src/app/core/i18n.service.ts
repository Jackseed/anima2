import { computed, effect, Injectable, signal } from '@angular/core';
import type { AbilityId } from '@anima/engine';
import { TEXTS, type Lang } from './texts';

const STORAGE_KEY = 'anima.lang';

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'fr' || saved === 'en') return saved;
  } catch {
    // Storage can be unavailable (private mode): fall back to the device language.
  }
  return navigator.language?.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

@Injectable({ providedIn: 'root' })
export class I18n {
  readonly lang = signal<Lang>(initialLang());
  // Templates read `i18n.t()`, so a language change re-renders them.
  readonly t = computed(() => TEXTS[this.lang()]);

  constructor() {
    effect(() => {
      const lang = this.lang();
      document.documentElement.lang = lang;
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // Not persisted: the language resets on next launch.
      }
    });
  }

  ability(id: AbilityId | undefined) {
    return id ? this.t().abilities[id] : undefined;
  }
}
