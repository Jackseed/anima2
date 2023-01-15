// Angular
import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';

// Rxjs
import { Observable, Subscription } from 'rxjs';

// Angular Material
import { MatDialog } from '@angular/material/dialog';

// Components
import { SettingsComponent } from '../settings/settings.component';
import { ScoreComponent } from '../score/score.component';

// States
import { Ability, Species, SpeciesQuery } from '../species/_state';
import { Player, PlayerQuery } from '../players/_state';
import { PlayService } from '../play.service';

import { GameQuery } from 'src/app/games/_state';

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

  private activePlayer$: Observable<Player>;
  public activeSpecies$: Observable<Species>;
  public abilities$: Observable<Ability[]>;
  public remainingActions$: Observable<number[]>;

  private colorSub: Subscription;

  constructor(
    public dialog: MatDialog,
    private gameQuery: GameQuery,
    private speciesQuery: SpeciesQuery,
    private playerQuery: PlayerQuery,
    private playService: PlayService
  ) {}

  ngOnInit(): void {
    this.activeSpecies$ = this.speciesQuery.selectActive();
    this.activePlayer$ = this.playerQuery.selectActive();
    this.abilities$ = this.speciesQuery.activeSpeciesAbilities$;

    this.remainingActions$ = this.gameQuery.remainingActionsArray$;

    this.colorSub = this.activePlayer$.subscribe((player) => {
      this.primaryColor = player?.primaryColor;
      this.secondaryColor = player?.secondaryColor;
    });
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

  ngOnDestroy(): void {
    this.colorSub.unsubscribe();
  }
}
