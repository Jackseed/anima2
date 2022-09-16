// Angular
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
// Material
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
// Firebase
import firebase from 'firebase/app';
// Rxjs
import { iif, Observable, of, Subscription } from 'rxjs';
import { filter, map, mergeMap, pluck, tap } from 'rxjs/operators';
// States
import { UserQuery } from 'src/app/auth/_state';
import { Game, GameQuery, GameService, startState } from 'src/app/games/_state';
import { PlayService } from '../play.service';
import { Player, PlayerQuery, PlayerService } from '../players/_state';
import {
  Abilities,
  abilities,
  Species,
  SpeciesQuery,
  SpeciesService,
} from '../species/_state';
import { Tile, TileQuery, TileService } from '../tiles/_state';

@Component({
  selector: 'app-board-view',
  templateUrl: './board-view.component.html',
  styleUrls: ['./board-view.component.scss'],
})
export class BoardViewComponent implements OnInit, OnDestroy {
  // Variables
  public playingPlayerId: string;
  // Observables
  public tiles$: Observable<Tile[]>;
  public species$: Observable<Species[]>;
  public game$: Observable<Game>;
  public players$: Observable<Player[]>;
  public activeSpecies$: Observable<Species>;
  // Subscriptions
  private turnSub: Subscription;
  private activePlayerSub: Subscription;
  private activeSpeciesSub: Subscription;
  private startGameSub: Subscription;

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private gameQuery: GameQuery,
    private gameService: GameService,
    private userQuery: UserQuery,
    private playerQuery: PlayerQuery,
    private playerService: PlayerService,
    private tileQuery: TileQuery,
    private tileService: TileService,
    private speciesQuery: SpeciesQuery,
    private speciesService: SpeciesService,
    private playService: PlayService,
    private snackbar: MatSnackBar
  ) {
    this.matIconRegistry.addSvgIcon(
      'close',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/menu-buttons/close-button.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'validate',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/menu-buttons/validate-button.svg'
      )
    );
  }

  ngOnInit(): void {
    this.game$ = this.gameQuery.selectActive();
    this.players$ = this.playerQuery.selectAll();
    this.activeSpecies$ = this.speciesQuery.selectActive();
    this.activePlayerSub = this.getActivePlayerSub();
    this.activeSpeciesSub = this.getActiveSpeciesSub();
    this.tiles$ = this.tileQuery
      .selectAll()
      .pipe(map((tiles) => tiles.sort((a, b) => a.id - b.id)));
    this.species$ = this.speciesQuery.selectAll();

    this.playingPlayerId = this.userQuery.getActiveId();

    this.turnSub = this.getTurnSub();
    this.startGameSub = this.playService.getStartGameSub();
  }

  // If no more actions for the active player, skips turn
  private getTurnSub(): Subscription {
    return this.game$
      .pipe(
        pluck('remainingActions'),
        mergeMap((remainingActions) =>
          iif(
            () => this.playerQuery.getActiveId() === this.playingPlayerId,
            of(remainingActions),
            of(true)
          )
        ),
        tap((bool) => {
          if (!bool) this.gameService.incrementTurnCount();
        })
      )
      .subscribe();
  }
  // base akita active player on game obj
  private getActivePlayerSub(): Subscription {
    return this.game$
      .pipe(
        pluck('activePlayerId'),
        tap((id) => this.playerService.setActive(id))
      )
      .subscribe();
  }
  // set active first species from active player
  private getActiveSpeciesSub(): Subscription {
    return this.playerQuery
      .selectActive()
      .pipe(
        filter((player) => !!player),
        pluck('speciesIds'),
        tap((ids) => this.speciesService.setActive(ids[0]))
      )
      .subscribe();
  }

  public async play(tileId: number) {
    const activeSpecies = this.speciesQuery.getActive();
    const tile = this.tileQuery.getEntity(tileId.toString());
    const game = this.gameQuery.getActive();
    const activePlayerId = game.activePlayerId;

    // Click on a blank tile.
    if (tile.type === 'blank') return;

    // Click during other player turn.
    if (activePlayerId !== this.playingPlayerId) {
      this.snackbar.open("Ce n'est pas à votre tour.", null, {
        duration: 3000,
      });
      return;
    }

    // Creates a new specie if it's the start of the game.
    if (
      game.isStarting &&
      tile.isReachable &&
      game.startState === 'tileChoice'
    ) {
      this.tileService.removeReachable();
      this.tileService.select(tileId);
      this.gameService.switchStartState('tileSelected');
    }
    if (game.startState === 'tileValidated') {
      this.speciesService.proliferate(activeSpecies.id, tileId, 4);
      this.tileService.removeReachable();
    }

    // checks if a unit is active & tile reachable & migration count > 1
    if (this.tileQuery.hasActive() && tile.isReachable) {
      // MIGRATION
      // check move limit then migrates
      if (this.migrationCount) {
        const activeTileId = this.tileQuery.getActiveId();
        await this.migrate(
          game,
          activeSpecies.id,
          Number(activeTileId),
          tileId,
          1
        );
      }
    }
    // checks if the tile includes an active species
    if (activeSpecies.tileIds.includes(tileId)) {
      // then selects the tile if it wasn't already.
      if (!this.isActive(tileId)) {
        this.tileService.removeReachable();
        this.tileService.select(tileId);
      }
    }
  }

  public isActive(tileId: number): boolean {
    return this.tileQuery.hasActive(tileId.toString());
  }

  private async migrate(
    game: Game,
    speciesId: string,
    previousTileId: number,
    newTileId: number,
    quantity: number
  ) {
    this.tileService.removeActive();
    this.tileService.removeReachable();

    this.speciesService
      .move(game, speciesId, previousTileId, newTileId, quantity)
      .then(async () => {
        this.snackbar.open('Migration effectuée !', null, {
          duration: 800,
          panelClass: 'orange-snackbar',
        });
        this.tileService.resetRange();
        // update remainingActions if that's the last migrationCount
        if (+this.migrationCount + 1 === quantity) {
          this.gameService.decrementRemainingActions();
        }
      })
      .catch((error) => {
        console.log('Migration failed: ', error);
      });
  }

  public getSpeciesImgUrl(speciesId: string): string {
    let url: string;
    const species = this.speciesQuery.getEntity(speciesId);

    if (species.playerId === 'neutral') {
      url = `/assets/neutrals/${species.id}.png`;
    } else {
      url = `/assets/abilities/${species.abilityIds[0]}.png`;
    }

    return url;
  }

  public getAbilityFrName(abilityId: Abilities) {
    return abilities[abilityId].fr;
  }
  public getAbilityValue(abilityId: Abilities) {
    return abilities[abilityId].value;
  }

  public get migrationCount(): number | firebase.firestore.FieldValue {
    const activeSpecies = this.speciesQuery.getActive();
    const activeAbilities = activeSpecies.abilityIds;
    const game = this.gameQuery.getActive();

    return activeAbilities.includes('agility')
      ? +game.migrationCount + abilities['agility'].value
      : game.migrationCount;
  }

  public validateStartTile() {
    this.playService.validateStartTile();
  }

  public cancelStartTileChoice() {
    this.playService.setStartTileChoice();
  }

  // Cancel tile focus when using "esc" on keyboard
  @HostListener('document:keydown', ['$event']) onKeydownHandler(
    event: KeyboardEvent
  ) {
    if (event.key === 'Escape') {
      this.tileService.removeActive();
      this.tileService.removeReachable();
    }
  }

  ngOnDestroy() {
    this.turnSub.unsubscribe();
    this.activePlayerSub.unsubscribe();
    this.activeSpeciesSub.unsubscribe();
    this.startGameSub.unsubscribe();
  }
}
