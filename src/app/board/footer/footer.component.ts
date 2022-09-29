// Angular
import { Component, OnInit } from '@angular/core';

// Components
import { AdaptationMenuComponent } from '../abilities/adaptation-menu/adaptation-menu.component';
import { AssimilationMenuComponent } from '../abilities/assimilation-menu/assimilation-menu.component';

// States
import { GameQuery } from 'src/app/games/_state';
import { TileQuery, TileService } from '../tiles/_state';
import { PlayService } from '../play.service';
import { SpeciesQuery } from '../species/_state';

// Angular Material
import { MatDialog } from '@angular/material/dialog';

// Rxjs
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { PlayerQuery } from '../players/_state';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  public migrationCount$: Observable<number>;
  public isMigrationActive$: Observable<boolean>;
  public canMigrate$: Observable<boolean>;
  public canProliferate$: Observable<boolean>;
  public canAssimilate$: Observable<boolean>;
  public canAdapt$: Observable<boolean>;

  constructor(
    public dialog: MatDialog,
    private gameQuery: GameQuery,
    private playService: PlayService,
    private playerQuery: PlayerQuery,
    private tileService: TileService,
    private tileQuery: TileQuery,
    private speciesQuery: SpeciesQuery
  ) {}

  ngOnInit(): void {
    this.migrationCount$ = this.gameQuery.migrationCount$;
    this.isMigrationActive$ = this.playService.isMigrationOngoing$;

    this.canMigrate$ = this.playService.canMigrate$;
    this.canProliferate$ = this.playService.canProliferate$;
    this.canAssimilate$ = this.playService.canAssimilate$;
    this.canAdapt$ = this.playService.canAdapt$;
  }

  public openAdaptationMenu(): void {
    this.dialog.open(AdaptationMenuComponent, {
      backdropClass: 'transparent-backdrop',
      panelClass: 'transparent-menu',
      disableClose: true,
      autoFocus: false,
      height: '100%',
      width: '100%',
    });
  }

  public openAssimilationMenu(): void {
    const activeTileId = Number(this.tileQuery.getActiveId());
    const species = this.speciesQuery.getTileSpecies(activeTileId);
    // Filters active species since you can't assimilate yourself.
    const activePlayerId = this.playerQuery.getActiveId();
    const otherSpecies = species.filter(
      (species) => species.playerId !== activePlayerId
    );

    this.dialog.open(AssimilationMenuComponent, {
      data: {
        listType: 'active',
        species: otherSpecies,
        speciesCount: 'tile',
        tileId: activeTileId,
      },
      autoFocus: false,
      backdropClass: 'transparent-backdrop',
      panelClass: 'transparent-menu',
      height: '100%',
      width: '100%',
    });
  }

  public startMigration() {
    this.playService.startMigration();
  }

  public proliferate() {
    this.playService.proliferate(2);
  }

  public stopMigration() {
    this.tileService.removeReachable();
  }
}
