import { Component, computed, DestroyRef, effect, inject, output, signal, untracked } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import {
  findSpecies,
  REGIONS,
  type AbilityId,
  type EraResult,
  type PlayerState,
  type RegionId,
  type SpeciesState,
} from '@anima/engine';
import { playerColor, type Colors } from '../core/colors';
import { I18n } from '../core/i18n.service';
import { MatchService } from '../core/match.service';
import { SpeciesHex } from '../shared/species-hex';
import { GameStore } from './game.store';

type Step = 'endEraTitle' | 'playerNamesTitle' | 'regionScore' | 'eraScore' | 'newEra' | 'newSpecies';
type FlashKind = 'start' | 'newSpecies' | 'yourTurn' | 'theirTurn';

interface SpeciesIcon {
  id: string;
  abilityId: AbilityId;
  colors: Colors;
}

interface RegionVariables {
  delay: number;
  from: number;
  to: number;
}

// Durations of the 1.x animations, in seconds.
const TITLE_DURATION = 1.3;
const REGION_DURATION = 0.5;
const REGION_GAP = REGION_DURATION / 2;
const ERA_DURATION = 1;
const PLAYER_TOTAL_DURATION = 2;
const ERA_FIRST_DELAY = 0.3;
const ERA_ENDING_DURATION = 1;
const NEW_ERA_DURATION = 3;
const NEW_SPECIES_DURATION = 3;
const START_FLASH_DURATION = 3;
const TURN_FLASH_DURATION = 2;
const VICTORY_TITLE = { duration: 1, delay: 0 };
const VICTORY_NAME = { duration: 0.9, delay: 1.8 };
const VICTORY_STARS_DELAY = 3.4;
const VICTORY_DETAILS = { duration: 1, delay: 3.7 };

function seenKey(matchId: string): string {
  return `anima.seenEras.${matchId}`;
}

function readSeen(matchId: string): number | null {
  try {
    const value = localStorage.getItem(seenKey(matchId));
    return value === null ? null : Number(value);
  } catch {
    return null;
  }
}

function writeSeen(matchId: string, count: number): void {
  try {
    localStorage.setItem(seenKey(matchId), String(count));
  } catch {
    // Without storage, the scoring animations simply replay on the next visit.
  }
}

@Component({
  selector: 'app-game-overlay',
  imports: [MatIcon, SpeciesHex],
  templateUrl: './game-overlay.html',
  styleUrl: './game-overlay.scss',
})
export class GameOverlay {
  protected readonly store = inject(GameStore);
  protected readonly t = inject(I18n).t;
  private readonly router = inject(Router);
  private readonly matches = inject(MatchService);
  readonly openSpeciesList = output<void>();

  protected readonly regions = REGIONS;
  protected readonly redColor = playerColor('red');
  protected readonly greenColor = playerColor('green');
  protected readonly victoryTitle = VICTORY_TITLE;
  protected readonly victoryName = VICTORY_NAME;
  protected readonly victoryStarsDelay = VICTORY_STARS_DELAY;
  protected readonly victoryDetails = VICTORY_DETAILS;

  readonly step = signal<Step | null>(null);
  readonly result = signal<EraResult | null>(null);
  readonly flash = signal<FlashKind | null>(null);
  protected readonly showScores = signal(true);
  protected readonly victoryAnimated = signal(false);
  private readonly sequenceRunning = signal(false);
  private timers: ReturnType<typeof setTimeout>[] = [];

  // The header and footer are hidden while a scoring animation plays, as in the 1.x app.
  readonly isAnimating = computed(() => this.step() !== null);
  readonly victoryVisible = computed(
    () => this.store.phase() === 'finished' && !this.sequenceRunning() && this.pendingEras() === 0,
  );
  readonly hidesBoardControls = computed(() => this.isAnimating() || this.victoryVisible());

  private readonly seenEras = signal<number | null>(null);
  private readonly pendingEras = computed(() => {
    const seen = this.seenEras();
    const count = this.store.state()?.eraResults.length ?? 0;
    return seen === null ? 0 : Math.max(0, count - seen);
  });

  protected readonly speciesIcons = computed(() => {
    const state = this.store.state();
    const icons: Record<string, SpeciesIcon[]> = {};
    if (!state) return icons;
    for (const player of state.players) {
      icons[player.id] = player.speciesIds
        .map((id) => findSpecies(state, id))
        .filter((species): species is SpeciesState => !!species && species.abilityIds.length > 0)
        .map((species) => ({ id: species.id, abilityId: species.abilityIds[0], colors: this.store.colorsOf(species) }));
    }
    return icons;
  });

  // Species being placed, shown when both players have chosen their traits.
  protected readonly newSpeciesIcons = computed(() => {
    const state = this.store.state();
    const setup = state?.setup;
    if (!state || !setup) return [];
    return state.players.map((player) => {
      const species = findSpecies(state, setup.choices[player.id]?.speciesId ?? '');
      return species && species.abilityIds[0]
        ? { id: species.id, abilityId: species.abilityIds[0], colors: this.store.colorsOf(species) }
        : null;
    });
  });

  protected readonly flashPlayer = computed(() => {
    const flash = this.flash();
    if (flash === 'yourTurn') return this.store.me();
    if (flash === 'theirTurn') return this.store.opponent();
    return undefined;
  });

  protected readonly regionVariables = computed(() => {
    const result = this.result();
    const variables: Record<string, Record<RegionId, RegionVariables>> = {};
    let delay = 0.2;
    if (!result) return { variables, total: 0 };
    for (const player of this.orderedPlayers()) {
      const scores = result.scores[player.id];
      let running = 0;
      variables[player.id] = {} as Record<RegionId, RegionVariables>;
      for (const region of REGIONS) {
        const points = scores?.regions[region.id] ?? 0;
        variables[player.id][region.id] = { delay, from: running, to: running + points };
        running += points;
        delay += REGION_DURATION + REGION_GAP;
      }
    }
    return { variables, total: delay + REGION_DURATION };
  });

  protected readonly eraVariables = computed(() => {
    const variables: Record<string, { eraScore: { delay: number }; playerTotal: { delay: number } }> = {};
    let delay = ERA_FIRST_DELAY;
    for (const player of this.orderedPlayers()) {
      const totalDelay = delay + ERA_DURATION * 0.3;
      variables[player.id] = { eraScore: { delay }, playerTotal: { delay: totalDelay } };
      delay = totalDelay + PLAYER_TOTAL_DURATION + 0.2;
    }
    return { variables, transitionDelay: delay, total: delay + ERA_ENDING_DURATION };
  });

  protected readonly orderedPlayers = computed<PlayerState[]>(() =>
    [this.store.green(), this.store.red()].filter((player): player is PlayerState => !!player),
  );

  protected readonly winner = computed(() => {
    const state = this.store.state();
    return state?.winner ? state.players.find((player) => player.id === state.winner!.playerId) : undefined;
  });
  protected readonly loser = computed(() => {
    const winner = this.winner();
    return this.store.players().find((player) => player.id !== winner?.id);
  });

  protected readonly allAbilitiesChosen = computed(() => {
    const setup = this.store.state()?.setup;
    return !!setup && Object.values(setup.choices).every((choice) => choice.abilityId !== null);
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => this.timers.forEach(clearTimeout));

    // Eras already scored when the game is first opened are not replayed.
    effect(() => {
      const id = this.store.matchId();
      const state = this.store.state();
      if (!id || !state || untracked(this.seenEras) !== null) return;
      const seen = readSeen(id) ?? state.eraResults.length;
      writeSeen(id, seen);
      this.seenEras.set(seen);
      this.victoryAnimated.set(state.phase === 'finished' && seen >= state.eraResults.length);
    });

    effect(() => {
      if (this.pendingEras() > 0 && !untracked(this.sequenceRunning)) untracked(() => this.playNextEra());
    });

    // Short overlays at the start of a placement and when the turn changes hands.
    let previousTurnPlayer: string | null | undefined;
    let flashedSetupEra: number | null = null;
    effect(() => {
      const state = this.store.state();
      if (!state) return;
      if (state.phase === 'setup' && this.allAbilitiesChosen() && flashedSetupEra !== state.era) {
        flashedSetupEra = state.era;
        untracked(() => this.showFlash('start', START_FLASH_DURATION));
      }
      const turnPlayer = state.phase === 'playing' ? (state.turn?.playerId ?? null) : null;
      if (turnPlayer && turnPlayer !== previousTurnPlayer && !untracked(this.sequenceRunning)) {
        untracked(() => this.showFlash(turnPlayer === this.store.uid() ? 'yourTurn' : 'theirTurn', TURN_FLASH_DURATION + 1));
      }
      previousTurnPlayer = turnPlayer;
    });
  }

  private showFlash(kind: FlashKind, seconds: number): void {
    this.flash.set(kind);
    this.later(seconds, () => {
      if (this.flash() === kind) this.flash.set(null);
    });
  }

  private later(seconds: number, action: () => void): void {
    this.timers.push(setTimeout(action, seconds * 1000));
  }

  // End of era sequence: titles, region scores, era totals, then the next era or the victory.
  private playNextEra(): void {
    const state = this.store.state();
    const seen = this.seenEras();
    if (!state || seen === null) return;
    const result = state.eraResults[seen];
    if (!result) return;
    this.sequenceRunning.set(true);
    this.flash.set(null);
    this.result.set(result);
    const isLast = state.phase === 'finished' && seen === state.eraResults.length - 1;
    const steps: [Step, number][] = [
      ['endEraTitle', TITLE_DURATION],
      ['playerNamesTitle', TITLE_DURATION * 2],
      ['regionScore', this.regionVariables().total],
      ['eraScore', this.eraVariables().total],
    ];
    if (!isLast) {
      steps.push(['newEra', NEW_ERA_DURATION]);
      if (result.era === 1) steps.push(['newSpecies', NEW_SPECIES_DURATION]);
    }
    let elapsed = 0;
    for (const [step, duration] of steps) {
      this.later(elapsed, () => this.step.set(step));
      elapsed += duration;
    }
    this.later(elapsed, () => {
      this.step.set(null);
      this.result.set(null);
      const next = seen + 1;
      writeSeen(this.store.matchId(), next);
      this.seenEras.set(next);
      this.sequenceRunning.set(false);
      if (this.pendingEras() > 0) this.playNextEra();
    });
  }

  protected toggleScores(): void {
    this.victoryAnimated.set(true);
    this.showScores.update((value) => !value);
  }

  protected leave(): void {
    void this.router.navigateByUrl('/home');
  }

  protected async cancelGame(): Promise<void> {
    await this.matches.cancel(this.store.matchId());
    this.leave();
  }

  protected nameColor(player: PlayerState | undefined): string {
    return player?.color === 'red' ? this.redColor : this.greenColor;
  }

  protected iconsOf(player: PlayerState | undefined): SpeciesIcon[] {
    return player ? (this.speciesIcons()[player.id] ?? []) : [];
  }

  protected eraOf(player: PlayerState) {
    return this.result()?.scores[player.id];
  }
}
