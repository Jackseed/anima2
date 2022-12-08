// Angular
import { Component, OnInit } from '@angular/core';

// Rxjs
import { Observable } from 'rxjs';

// States
import { AbilityService } from '../../ability.service';
import { PlayService } from '../../play.service';
import { Ability, AbilityId, SpeciesQuery } from '../../species/_state';

@Component({
  selector: 'app-active-bar',
  templateUrl: './active-bar.component.html',
  styleUrls: ['./active-bar.component.scss'],
})
export class ActiveBarComponent implements OnInit {
  public activeSpeciesActiveAbilities$: Observable<Ability[]>;

  public activeAbilityNumber$: Observable<number>;
  public activeAbilities$: Observable<Ability[]>;

  constructor(
    private speciesQuery: SpeciesQuery,
    private abilityService: AbilityService,
    private playService: PlayService
  ) {}

  ngOnInit(): void {
    this.activeSpeciesActiveAbilities$ =
      this.speciesQuery.activeSpeciesActiveAbilities$;
    this.activeAbilityNumber$ =
      this.speciesQuery.activeSpeciesActiveAbilitiesNumber$;
    this.activeAbilities$ = this.speciesQuery.activeSpeciesActiveAbilities$;
  }
  public canActiveAbility$(abilityId: AbilityId): Observable<boolean> {
    return this.abilityService.canActiveAbility$(abilityId);
  }

  public activeAbility(abilityId: AbilityId) {
    if (abilityId === 'intimidate') this.intimidate();
  }

  public intimidate() {
    this.playService.openIntimidateMenu();
  }
}
