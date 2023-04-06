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
import { BasicAction, BASIC_ACTIONS, SpeciesQuery } from '../species/_state';
import { PlayerQuery, PlayerService } from '../players/_state';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  public remainingMigrations$: Observable<number>;
  public basicActions = BASIC_ACTIONS;

  constructor(
    private tileService: TileService,
    private speciesQuery: SpeciesQuery,
    private playerQuery: PlayerQuery,
    private playerService: PlayerService,
    private playService: PlayService,
    private abilityService: AbilityService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.remainingMigrations$ = this.abilityService.remainingMigrations$;
  }

  public isActionActive$(action: BasicAction): Observable<boolean> {
    return this.abilityService.isActionOngoing$(action);
  }

  public isAnotherActionActive$(action: BasicAction): Observable<boolean> {
    return this.abilityService.isAnotherActionOngoing$(action);
  }

  public canActivateAction$(action: BasicAction): Observable<boolean> {
    return this.abilityService.canActivateAction$(action);
  }

  public async activeAction(action: BasicAction) {
    if (action === 'assimilation') this.playService.setupAssimilation();
    if (action === 'migration') this.abilityService.startMigration();
    if (action === 'proliferation') this.abilityService.setupProliferation();
    const activeSpeciesId = this.speciesQuery.getActiveId();
    if (action === 'adaptation') {
      const activePlayerId = this.playerQuery.getActiveId();
      await this.playerService.setRandomAbilityChoice([activePlayerId]);
    }
  }

  public async stopAction(action: BasicAction) {
    if (action === 'assimilation') this.tileService.removeAttackable();
    if (action === 'migration') this.tileService.removeReachable();
    if (action === 'proliferation') this.tileService.removeProliferable();
  }
}
