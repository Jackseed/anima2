// Angular
import { Component, OnInit } from '@angular/core';

// Rxjs
import { Observable } from 'rxjs';

// States
import { Game, GameQuery } from 'src/app/games/_state';
import { Player, PlayerQuery } from '../players/_state';
import { AbilityId, abilities, Species, SpeciesQuery } from '../species/_state';

@Component({
  selector: 'app-score',
  templateUrl: './score.component.html',
  styleUrls: ['./score.component.scss'],
})
export class ScoreComponent implements OnInit {
  public game$: Observable<Game>;
  public players$: Observable<Player[]>;
  public activeSpecies$: Observable<Species>;
  public activeSpeciesAbilityIds$: Observable<AbilityId[]>;
  constructor(
    private gameQuery: GameQuery,
    private playerQuery: PlayerQuery,
    private speciesQuery: SpeciesQuery
  ) {}

  ngOnInit(): void {
    this.game$ = this.gameQuery.selectActive();
    this.players$ = this.playerQuery.selectAll();
    this.activeSpecies$ = this.speciesQuery.selectActive();
    this.activeSpeciesAbilityIds$ = this.speciesQuery.activeSpeciesAbilityIds$;
  }

  // TODO: remove these
  public getAbilityFrName(abilityId: AbilityId) {
    return abilities[abilityId].fr;
  }
  public getAbilityValue(abilityId: AbilityId) {
    return abilities[abilityId].value;
  }
}
