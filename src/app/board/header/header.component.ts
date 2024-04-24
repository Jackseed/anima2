// Angular
import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';

// Rxjs
import { Observable, Subscription, combineLatest } from 'rxjs';

// Angular Material
import { MatDialog } from '@angular/material/dialog';

// Components
import { SettingsComponent } from '../settings/settings.component';
import { ScoreComponent } from '../score/score.component';

// States
import { Ability, Species, SpeciesQuery } from '../species/_state';
import { PlayService } from '../play.service';

import { GameQuery, GameService } from 'src/app/games/_state';
import { PlayerQuery } from '../players/_state';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  @HostBinding('style.--primary-color')
  public primaryColor: string;

  @HostBinding('style.--secondary-color')
  public secondaryColor: string;

  public activeSpecies$: Observable<Species> = this.speciesQuery.selectActive();
  public abilities$: Observable<Ability[]> =
    this.speciesQuery.activeSpeciesAbilities$;
  public remainingActions$: Observable<number[]> =
    this.gameQuery.remainingActionsArray$;
  public isActivePlayerPlaying$: Observable<boolean> =
    this.playerQuery.isActivePlayerPlaying$;
  public isGameStarting$: Observable<boolean> = this.gameQuery.isStarting$;
  public isAnimationPlaying$: Observable<boolean> =
    this.playerQuery.isAnimationPlaying$;
  public isSkippingTurnEnabled$: Observable<boolean>;

  private colorSub: Subscription;

  constructor(
    public dialog: MatDialog,
    private gameQuery: GameQuery,
    private gameService: GameService,
    private speciesQuery: SpeciesQuery,
    private playService: PlayService,
    private playerQuery: PlayerQuery
  ) {}

  ngOnInit(): void {
    this.colorSub = this.activeSpecies$.subscribe((activeSpecies) => {
      this.primaryColor = activeSpecies?.colors.primary;
      this.secondaryColor = activeSpecies?.colors.secondary;
    });
    this.isSkippingTurnEnabled$ = combineLatest([
      this.isActivePlayerPlaying$,
      this.isGameStarting$,
      this.isAnimationPlaying$,
    ]).pipe(
      map(([isActivePlayerPlaying, isGameStarting, isAnimPlaying]) => {
        return isActivePlayerPlaying && !isGameStarting && !isAnimPlaying;
      })
    );
  }

  public openSpeciesList(): void {
    this.playService.openSpeciesList();
  }

  public openScore(): void {
    const dialogRef = this.dialog.open(ScoreComponent, {
      height: '60%',
      panelClass: 'custom-container',
      autoFocus: false,
    });
  }

  public openSettings(): void {
    const dialogRef = this.dialog.open(SettingsComponent, {
      height: '60%',
      panelClass: 'custom-container',
      autoFocus: false,
    });
  }

  public skipTurn() {
    this.gameService.skipTurn();
  }

  ngOnDestroy(): void {
    this.colorSub.unsubscribe();
  }
}
