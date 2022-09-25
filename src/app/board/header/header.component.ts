// Angular
import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';

// Angular Material
import { MatDialog } from '@angular/material/dialog';

// Components
import { SettingsComponent } from '../settings/settings.component';
import { ScoreComponent } from '../score/score.component';

// States
import { Species, SpeciesQuery, SpeciesService } from '../species/_state';

// Rxjs
import { Observable, Subscription } from 'rxjs';
import { Player, PlayerQuery } from '../players/_state';

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
  private colorSub: Subscription;

  constructor(
    public dialog: MatDialog,
    private speciesQuery: SpeciesQuery,
    private speciesService: SpeciesService,
    private playerQuery: PlayerQuery
  ) {}

  ngOnInit(): void {
    this.activeSpecies$ = this.speciesQuery.selectActive();
    this.activePlayer$ = this.playerQuery.selectActive();
    this.colorSub = this.activePlayer$.subscribe((player) => {
      this.primaryColor = player?.primaryColor;
      this.secondaryColor = player?.secondaryColor;
    });
  }

  public openSpeciesList(): void {
    this.speciesService.openSpeciesList();
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
