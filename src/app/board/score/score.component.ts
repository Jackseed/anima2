import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Game, GameQuery } from 'src/app/games/_state';
import { Player, PlayerQuery } from '../players/_state';
import { Abilities, abilities, Species, SpeciesQuery } from '../species/_state';

@Component({
  selector: 'app-score',
  templateUrl: './score.component.html',
  styleUrls: ['./score.component.scss'],
})
export class ScoreComponent implements OnInit {
  public game$: Observable<Game>;
  public players$: Observable<Player[]>;
  public activeSpecies$: Observable<Species>;
  constructor(
    private gameQuery: GameQuery,
    private playerQuery: PlayerQuery,
    private speciesQuery: SpeciesQuery
  ) {}

  ngOnInit(): void {
    this.game$ = this.gameQuery.selectActive();
    this.players$ = this.playerQuery.selectAll();
    this.activeSpecies$ = this.speciesQuery.selectActive();
  }

  public getAbilityFrName(abilityId: Abilities) {
    return abilities[abilityId].fr;
  }
  public getAbilityValue(abilityId: Abilities) {
    return abilities[abilityId].value;
  }
}
