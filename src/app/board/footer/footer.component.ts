// Angular
import { Component, OnInit } from '@angular/core';

// Rxjs
import { Observable } from 'rxjs';

// States
import { GameQuery } from 'src/app/games/_state';
import { PlayService } from '../play.service';
import { TileService } from '../tiles/_state';

// Material
import { MatDialog } from '@angular/material/dialog';

// Components
import { AdaptationMenuComponent } from '../abilities/adaptation-menu/adaptation-menu.component';

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
    private gameQuery: GameQuery,
    private tileService: TileService,
    private playService: PlayService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.migrationCount$ = this.gameQuery.migrationCount$;
    this.isMigrationActive$ = this.playService.isMigrationOngoing$;

    this.canMigrate$ = this.playService.canMigrate$;
    this.canProliferate$ = this.playService.canProliferate$;
    this.canAssimilate$ = this.playService.canAssimilate$;
    this.canAdapt$ = this.playService.canAdapt$;
  }

  public async openAdaptationMenu(): Promise<void> {
    await this.playService.setupAdaptation();
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
    this.playService.openAssimilationMenu();
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
