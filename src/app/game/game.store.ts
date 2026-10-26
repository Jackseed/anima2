import { computed, DestroyRef, effect, inject, Injectable, signal, untracked } from '@angular/core';
import {
  applyCommand,
  assimilationRange,
  assimilationTargets,
  canStartAction,
  COLS,
  findSpecies,
  intimidationTargets,
  isPlayable,
  isPlayersTurn,
  migrationTargets,
  proliferationTargets,
  quantityOn,
  rallyingSources,
  remainingMigrationPoints,
  seededRng,
  speciesOnTile,
  tileType,
  TILE_COUNT,
  totalQuantity,
  tunnelTargets,
  type AbilityId,
  type Command,
  type GameState,
  type PlayAction,
  type SpeciesState,
  type TileType,
} from '@anima/engine';
import { AuthService } from '../core/auth.service';
import { speciesColors, type Colors } from '../core/colors';
import { I18n } from '../core/i18n.service';
import { CommandRejected, MatchService, type MatchDoc } from '../core/match.service';
import { ToastService } from '../core/toast.service';

export type Mode = 'idle' | 'migration' | 'tunnel' | 'proliferation' | 'assimilation' | 'rallying';

export interface OccupantView {
  speciesId: string;
  quantity: number;
  abilityId: AbilityId | undefined;
  colors: Colors;
}

export interface TileView {
  id: number;
  type: TileType;
  occupants: OccupantView[];
}

export interface SpeciesView {
  species: SpeciesState;
  colors: Colors;
  // Individuals on the listed tile, or in total.
  count: number;
}

export interface SpeciesListRequest {
  tileId: number | null;
  // Set when the list asks the player to pick a target.
  action: 'assimilate' | 'intimidate' | null;
  speciesIds: string[];
}

const NEW_SEED = () => Math.floor(Math.random() * 2 ** 32);

// State of one game screen: the Firestore document, an optimistic preview of the last
// command, and the local selection. Provided by the game page.
@Injectable()
export class GameStore {
  private readonly matches = inject(MatchService);
  private readonly auth = inject(AuthService);
  private readonly i18n = inject(I18n);
  private readonly toast = inject(ToastService);

  readonly matchId = signal('');
  readonly match = signal<MatchDoc | null | undefined>(undefined);
  readonly connectionError = signal(false);
  private readonly optimistic = signal<{ version: number; state: GameState } | null>(null);

  readonly uid = this.auth.uid;
  readonly state = computed<GameState | null>(() => {
    const match = this.match();
    const optimistic = this.optimistic();
    if (optimistic && (!match || optimistic.version > match.version)) return optimistic.state;
    return match?.state ?? null;
  });
  readonly phase = computed(() => this.state()?.phase ?? null);
  readonly players = computed(() => this.state()?.players ?? []);
  readonly me = computed(() => this.players().find((player) => player.id === this.uid()));
  readonly opponent = computed(() => this.players().find((player) => player.id !== this.uid()));
  readonly green = computed(() => this.players().find((player) => player.color === 'green'));
  readonly red = computed(() => this.players().find((player) => player.color === 'red'));
  readonly isMyTurn = computed(() => {
    const state = this.state();
    const uid = this.uid();
    return !!state && !!uid && isPlayersTurn(state, uid);
  });
  readonly turnSpecies = computed(() => {
    const state = this.state();
    return state?.turn ? findSpecies(state, state.turn.speciesId) : undefined;
  });
  readonly mySetup = computed(() => {
    const uid = this.uid();
    return (uid && this.state()?.setup?.choices[uid]) || null;
  });
  readonly pendingAdaptation = computed(() => (this.isMyTurn() ? this.state()?.turn?.pendingAdaptation ?? null : null));
  // Scoring animations only follow what Firestore confirmed, never a preview.
  readonly confirmedState = computed(() => this.match()?.state ?? null);

  // Local selection.
  readonly selectedTileId = signal<number | null>(null);
  readonly mode = signal<Mode>('idle');
  readonly pendingStartTileId = signal<number | null>(null);
  readonly speciesList = signal<SpeciesListRequest | null>(null);
  readonly playedTileIds = signal<number[]>([]);
  readonly busy = signal(false);

  readonly tiles = computed<TileView[]>(() => {
    const state = this.state();
    return Array.from({ length: TILE_COUNT }, (_, id) => ({
      id,
      type: tileType(id),
      occupants: state ? this.occupants(state, id) : [],
    }));
  });

  readonly highlights = computed<ReadonlySet<number>>(() => {
    const state = this.state();
    const tileId = this.selectedTileId();
    if (!state) return new Set();
    if (this.mySetup()?.abilityId && this.mySetup()?.tileId === null) {
      return new Set(this.tiles().filter((tile) => isPlayable(tile.id)).map((tile) => tile.id));
    }
    if (tileId === null) return new Set(this.playedTileIds());
    switch (this.mode()) {
      case 'migration':
        return new Set(migrationTargets(state, tileId).keys());
      case 'tunnel':
        return new Set(tunnelTargets(state, tileId));
      case 'proliferation':
        return new Set(proliferationTargets(state, tileId));
      case 'assimilation':
        return new Set(assimilationTargets(state, tileId).map((target) => target.tileId));
      case 'rallying':
        return new Set(rallyingSources(state, tileId));
      default:
        return new Set(this.playedTileIds());
    }
  });

  readonly remainingMigrations = computed(() => {
    const state = this.state();
    return state ? remainingMigrationPoints(state) : 0;
  });

  constructor() {
    const destroyRef = inject(DestroyRef);
    let unsubscribe: (() => void) | undefined;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    // A Firestore listener stops for good after an error: subscribe again a bit later.
    const listen = (id: string) => {
      unsubscribe?.();
      unsubscribe = this.matches.watch(
        id,
        (match) => {
          this.connectionError.set(false);
          this.match.set(match);
          const optimistic = untracked(this.optimistic);
          if (optimistic && match && match.version >= optimistic.version) this.optimistic.set(null);
        },
        () => {
          this.connectionError.set(true);
          clearTimeout(retryTimer);
          retryTimer = setTimeout(() => listen(id), 3000);
        },
      );
    };
    effect(() => {
      const id = this.matchId();
      clearTimeout(retryTimer);
      unsubscribe?.();
      if (id) listen(id);
    });
    destroyRef.onDestroy(() => {
      clearTimeout(retryTimer);
      unsubscribe?.();
    });

    effect(() => {
      const setup = this.mySetup();
      if (!setup || setup.tileId !== null) untracked(() => this.pendingStartTileId.set(null));
    });

    // Drops a selection that no longer makes sense (turn passed, individuals gone).
    effect(() => {
      const state = this.state();
      const tileId = untracked(this.selectedTileId);
      const species = this.turnSpecies();
      if (tileId === null) return;
      if (!state || !this.isMyTurn() || !species || quantityOn(species, tileId) === 0) this.clearSelection();
    });
  }

  private occupants(state: GameState, tileId: number): OccupantView[] {
    return speciesOnTile(state, tileId).map(({ speciesId, quantity }) => {
      const species = findSpecies(state, speciesId)!;
      return { speciesId, quantity, abilityId: species.abilityIds[0], colors: speciesColors(state, species) };
    });
  }

  speciesViews(request: SpeciesListRequest): SpeciesView[] {
    const state = this.state();
    if (!state) return [];
    const uid = this.uid();
    const rank = (species: SpeciesState) => (species.ownerId === uid ? 0 : species.ownerId === 'neutral' ? 2 : 1);
    return request.speciesIds
      .map((id) => findSpecies(state, id))
      .filter((species): species is SpeciesState => !!species)
      .map((species) => ({
        species,
        colors: speciesColors(state, species),
        count: request.tileId === null ? totalQuantity(species) : quantityOn(species, request.tileId),
      }))
      .sort((a, b) => rank(a.species) - rank(b.species) || b.count - a.count);
  }

  colorsOf(species: SpeciesState): Colors {
    const state = this.state();
    return state ? speciesColors(state, species) : { primary: 'grey', secondary: 'grey' };
  }

  clearSelection(): void {
    this.selectedTileId.set(null);
    this.mode.set('idle');
  }

  canStart(action: PlayAction): boolean {
    const state = this.state();
    const uid = this.uid();
    const tileId = this.selectedTileId();
    if (!state || !uid || tileId === null || this.busy()) return false;
    return canStartAction(state, uid, action, tileId);
  }

  // Tile clicks, in the order of the 1.x app: placement, then the action in progress, then selection.
  clickTile(tileId: number): void {
    const state = this.state();
    const uid = this.uid();
    if (!state || !uid || !isPlayable(tileId)) return;
    const occupied = speciesOnTile(state, tileId).length > 0;

    if (state.phase === 'finished' || state.phase === 'waiting') {
      if (occupied) this.openSpeciesList(tileId);
      return;
    }

    const setup = this.mySetup();
    if (state.phase === 'setup') {
      if (setup?.abilityId && setup.tileId === null) this.pendingStartTileId.set(tileId);
      else if (occupied) this.openSpeciesList(tileId);
      return;
    }

    if (!this.isMyTurn()) {
      if (occupied) this.openSpeciesList(tileId);
      else this.toast.show(this.i18n.t().game.notYourTurn);
      return;
    }

    const selected = this.selectedTileId();
    if (selected !== null && this.mode() !== 'idle' && this.highlights().has(tileId)) {
      this.completeAction(selected, tileId);
      return;
    }

    const species = this.turnSpecies();
    if (species && quantityOn(species, tileId) > 0 && selected !== tileId) {
      this.selectedTileId.set(tileId);
      this.mode.set('idle');
      return;
    }
    if (occupied) this.openSpeciesList(tileId);
  }

  private completeAction(fromTileId: number, tileId: number): void {
    switch (this.mode()) {
      // As in the 1.x app, moving or proliferating ends the selection.
      case 'migration':
        this.clearSelection();
        void this.send({ type: 'migrate', fromTileId, toTileId: tileId });
        break;
      case 'tunnel':
        this.clearSelection();
        void this.send({ type: 'tunnel', fromTileId, toTileId: tileId });
        break;
      case 'proliferation':
        this.clearSelection();
        void this.send({ type: 'proliferate', tileId: fromTileId, targetTileId: tileId });
        break;
      case 'rallying':
        void this.send({ type: 'rally', tileId: fromTileId, fromTileId: tileId });
        this.mode.set('idle');
        break;
      case 'assimilation':
        this.assimilateOn(fromTileId, tileId);
        break;
    }
  }

  // Footer and active bar buttons.
  startAction(action: PlayAction): void {
    const state = this.state();
    const tileId = this.selectedTileId();
    if (!state || tileId === null || !this.canStart(action)) return;
    switch (action) {
      case 'migration':
      case 'tunnel':
      case 'rallying':
        this.mode.set(action);
        break;
      case 'proliferation': {
        const targets = proliferationTargets(state, tileId);
        if (targets.length === 1) {
          this.clearSelection();
          void this.send({ type: 'proliferate', tileId, targetTileId: targets[0] });
        } else {
          this.mode.set('proliferation');
        }
        break;
      }
      case 'assimilation': {
        const attacker = this.turnSpecies()!;
        if (assimilationRange(attacker) === 0) this.assimilateOn(tileId, tileId);
        else this.mode.set('assimilation');
        break;
      }
      case 'adaptation':
        void this.send({ type: 'startAdaptation', tileId });
        break;
      case 'intimidation':
        this.speciesList.set({ tileId, action: 'intimidate', speciesIds: intimidationTargets(state, tileId) });
        break;
    }
  }

  stopAction(): void {
    this.mode.set('idle');
  }

  private assimilateOn(fromTileId: number, targetTileId: number): void {
    const state = this.state()!;
    const targets = assimilationTargets(state, fromTileId).filter((target) => target.tileId === targetTileId);
    this.mode.set('idle');
    if (targets.length === 1) {
      void this.send({ type: 'assimilate', tileId: fromTileId, targetTileId, targetSpeciesId: targets[0].speciesId });
    } else if (targets.length > 1) {
      this.speciesList.set({ tileId: targetTileId, action: 'assimilate', speciesIds: targets.map((t) => t.speciesId) });
    }
  }

  // Validation of the species list when it was opened to pick a target.
  chooseTarget(speciesId: string): void {
    const request = this.speciesList();
    const fromTileId = this.selectedTileId();
    this.speciesList.set(null);
    if (!request || request.tileId === null || fromTileId === null) return;
    if (request.action === 'assimilate') {
      void this.send({ type: 'assimilate', tileId: fromTileId, targetTileId: request.tileId, targetSpeciesId: speciesId });
    } else if (request.action === 'intimidate') {
      void this.send({ type: 'intimidate', tileId: fromTileId, targetSpeciesId: speciesId });
    }
  }

  openSpeciesList(tileId: number | null): void {
    const state = this.state();
    if (!state) return;
    const speciesIds =
      tileId === null
        ? state.species.map((species) => species.id)
        : speciesOnTile(state, tileId).map((occupant) => occupant.speciesId);
    this.speciesList.set({ tileId, action: null, speciesIds });
  }

  async confirmStartTile(): Promise<void> {
    const tileId = this.pendingStartTileId();
    if (tileId === null) return;
    this.pendingStartTileId.set(null);
    await this.send({ type: 'chooseStartTile', tileId });
  }

  showPlayedTiles(tileIds: number[]): void {
    this.playedTileIds.set(tileIds);
    setTimeout(() => {
      if (this.playedTileIds() === tileIds) this.playedTileIds.set([]);
    }, 3500);
  }

  // Shows the result at once, then confirms it with a Firestore transaction.
  async send(command: Command): Promise<boolean> {
    const state = this.state();
    const match = this.match();
    const uid = this.uid();
    if (!state || !match || !uid || this.busy()) return false;
    const seed = NEW_SEED();
    const preview = applyCommand(state, uid, command, seededRng(seed));
    if (!preview.ok) {
      this.toast.show(this.errorText(preview.error));
      return false;
    }
    this.busy.set(true);
    // The preview follows the state on screen, which can be ahead of the last snapshot.
    const shownVersion = Math.max(match.version, this.optimistic()?.version ?? 0);
    this.optimistic.set({ version: shownVersion + 1, state: preview.state });
    try {
      const written = await this.matches.send(match.id, command, seed);
      // Keeps what was written (a concurrent move may have changed it) until its snapshot arrives.
      if ((this.match()?.version ?? 0) < written.version) this.optimistic.set(written);
      return true;
    } catch (error) {
      this.optimistic.set(null);
      this.toast.show(this.errorText(error instanceof CommandRejected ? error.code : null));
      return false;
    } finally {
      this.busy.set(false);
    }
  }

  errorText(code: string | null): string {
    const texts = this.i18n.t().errors;
    if (!code) return navigator.onLine === false ? texts.network : texts.generic;
    return texts.rules[code as keyof typeof texts.rules] ?? texts.generic;
  }

  tileRow(tileId: number): number {
    return Math.floor(tileId / COLS);
  }
}
