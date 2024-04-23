// Angular
import { Component, Inject, OnInit } from '@angular/core';

// Material
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

// Rxjs
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
// States
import { Player, PlayerQuery } from '../../players/_state';
import { Ability, Species, SpeciesQuery } from '../../species/_state';
import { AbilityService } from '../../ability.service';

@Component({
  selector: 'app-menu',
  templateUrl: './adaptation-menu.component.html',
  styleUrls: ['./adaptation-menu.component.scss'],
})
export class AdaptationMenuComponent implements OnInit {
  public abilityChoices$: Observable<Ability[]>;
  public activeAbility: Ability = undefined;
  public activePlayer$: Observable<Player> =
    this.playerQuery.activePlayerSuperchargedWithSpecies$;
  public isNewSpecies$: Observable<boolean> = this.activePlayer$.pipe(
    map(
      (player) =>
        player.species[player.species.length - 1].abilities.length === 0
    )
  );
  public activeSpecies: Species = this.speciesQuery.getActive();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: string,
    private speciesQuery: SpeciesQuery,
    private playerQuery: PlayerQuery,
    private abilityService: AbilityService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.abilityChoices$ = this.playerQuery.abilityChoices$;
  }

  public activate(i: number) {
    const abilities = this.playerQuery.abilityChoices;
    this.activeAbility = abilities[i];
  }

  public validate() {
    this.dialog.closeAll();
    this.abilityService.adapt(this.activeAbility, this.data);
  }
}
