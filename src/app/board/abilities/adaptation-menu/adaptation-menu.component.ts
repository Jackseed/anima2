// Angular
import { Component, OnInit } from '@angular/core';

// Material
import { MatDialogRef } from '@angular/material/dialog';

// Rxjs
import { Observable } from 'rxjs';

// States
import { PlayerQuery } from '../../players/_state';
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

  constructor(
    public dialogRef: MatDialogRef<AdaptationMenuComponent>,
    private playerQuery: PlayerQuery,
    private abilityService: AbilityService
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
    this.abilityService.adapt(this.activeAbility);
    this.dialogRef.close();
  }
}
