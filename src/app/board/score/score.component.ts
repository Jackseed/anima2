// Angular
import { Component, OnInit } from '@angular/core';

// Rxjs
import { Observable } from 'rxjs';

// States
import { Game, GameQuery } from 'src/app/games/_state';
import { AbilityService } from '../ability.service';
import { Player, PlayerQuery } from '../players/_state';
import { Species, SpeciesQuery } from '../species/_state';

@Component({
  selector: 'app-score',
  templateUrl: './score.component.html',
  styleUrls: ['./score.component.scss'],
})
export class ScoreComponent implements OnInit {
  public game$: Observable<Game>;
  public players$: Observable<Player[]>;
  public activeSpecies$: Observable<Species>;
  public remainingMigrations$: Observable<number>;

  constructor(
    private gameQuery: GameQuery,
    private playerQuery: PlayerQuery,
    private speciesQuery: SpeciesQuery,
    private abilityService: AbilityService
  ) {}

  ngOnInit(): void {
    this.game$ = this.gameQuery.selectActive();
    this.players$ = this.playerQuery.selectAll();
    this.activeSpecies$ = this.speciesQuery.selectActive();
    this.remainingMigrations$ = this.abilityService.remainingMigrations$;
  }

  public getPlayerName(playerId: string): string {
    return this.playerQuery.getEntity(playerId).name;
  }
}
