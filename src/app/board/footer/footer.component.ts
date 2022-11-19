// Angular
import { Component, OnInit } from '@angular/core';

// Rxjs
import { Observable } from 'rxjs';

// States
import { PlayService } from '../play.service';
import { TileService } from '../tiles/_state';

// Material
import { MatDialog } from '@angular/material/dialog';

// Components
import { AbilityService } from '../ability.service';

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
    private tileService: TileService,
    private playService: PlayService,
    private abilityService: AbilityService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.migrationCount$ = this.abilityService.remainingMigrations$;
    this.isMigrationActive$ = this.abilityService.isMigrationOngoing$;

    this.canMigrate$ = this.abilityService.canMigrate$;
    this.canProliferate$ = this.abilityService.canProliferate$;
    this.canAssimilate$ = this.abilityService.canAssimilate$;
    this.canAdapt$ = this.abilityService.canAdapt$;
  }

  public async openAdaptationMenu(): Promise<void> {
    await this.playService.setupAdaptation();
  }

  public openAssimilationMenu(): void {
    this.playService.openAssimilationMenu();
  }

  public startMigration() {
    this.abilityService.startMigration();
  }

  public proliferate() {
    this.abilityService.proliferate();
  }

  public stopMigration() {
    this.tileService.removeReachable();
  }
}
