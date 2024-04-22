// Angular
import { Component, Inject, OnInit } from '@angular/core';

// Material
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

// Rxjs
import { Observable } from 'rxjs';

// States
import { Player, PlayerQuery } from '../../players/_state';
import { Ability } from '../../species/_state';
import { AbilityService } from '../../ability.service';
import { Colors } from 'src/app/games/_state';

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

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: string,
    private playerQuery: PlayerQuery,
    private abilityService: AbilityService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.abilityChoices$ = this.playerQuery.abilityChoices$;
  }

  public getActivePlayerSpeciesColors(): Colors {
    const playerId = this.playerQuery.getActiveId();
    return this.playerQuery.getPlayerColors(playerId);
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
