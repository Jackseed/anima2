// Angular
import { Component, OnInit } from '@angular/core';

// Rxjs
import { Observable } from 'rxjs';

// Material
import { MatDialog } from '@angular/material/dialog';

// States
import { PlayService } from '../play.service';
import { TileService } from '../tiles/_state';
import { AbilityService } from '../ability.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  public remainingMigrations$: Observable<number>;
  public isMigrationActive$: Observable<boolean>;
  public canMigrate$: Observable<boolean>;
  public isProliferationActive$: Observable<boolean>;
  public canProliferate$: Observable<boolean>;
  public isAssimilationActive$: Observable<boolean>;
  public canAssimilate$: Observable<boolean>;
  public canAdapt$: Observable<boolean>;

  constructor(
    private tileService: TileService,
    private playService: PlayService,
    private abilityService: AbilityService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.remainingMigrations$ = this.abilityService.remainingMigrations$;

    this.isMigrationActive$ = this.abilityService.isMigrationOngoing$;
    this.isAssimilationActive$ = this.abilityService.isAssimilationOngoing$;
    this.isProliferationActive$ = this.abilityService.isProliferationOngoing$;

    this.canMigrate$ = this.abilityService.canMigrate$;
    this.canProliferate$ = this.abilityService.canProliferate$;
    this.canAssimilate$ = this.abilityService.canAssimilate$;
    this.canAdapt$ = this.abilityService.canAdapt$;
  }

  public isAnotherActionActive$(
    than?: 'assimilation' | 'migration' | 'proliferation'
  ): Observable<boolean> {
    return this.abilityService.isSomethingElseOngoing$(than);
  }

  public async openAdaptationMenu(): Promise<void> {
    await this.playService.setupAdaptation();
  }

  public setupAssimilation(): void {
    this.playService.setupAssimilation();
  }

  public stopAssimilation() {
    this.tileService.removeAttackable();
  }

  public startMigration() {
    this.abilityService.startMigration();
  }

  public stopMigration() {
    this.tileService.removeReachable();
  }

  public proliferate() {
    this.abilityService.setupProliferation();
  }

  public stopProliferation() {
    this.tileService.removeProliferable();
  }
}
