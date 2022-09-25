// Angular
import { Component, OnInit } from '@angular/core';

// Components
import { AdaptationMenuComponent } from '../abilities/adaptation-menu/adaptation-menu.component';
import { AssimilationMenuComponent } from '../abilities/assimilation-menu/assimilation-menu.component';

// States
import { GameQuery } from 'src/app/games/_state';
import { TileService } from '../tiles/_state';
import { PlayService } from '../play.service';

// Angular Material
import { MatDialog } from '@angular/material/dialog';

// Rxjs
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

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
    private tileService: TileService
  ) {}

  ngOnInit(): void {
    this.migrationCount$ = this.gameQuery
      .selectActive()
      .pipe(map((game) => Number(game.migrationCount)));
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
    this.dialog.open(AssimilationMenuComponent, {
      data: {
        comp: 'assimilation',
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
