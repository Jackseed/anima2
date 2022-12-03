// Angular
import { Component, OnInit } from '@angular/core';

// Rxjs
import { Observable } from 'rxjs';

// States
import { AbilityService } from '../../ability.service';
import { Ability, SpeciesQuery } from '../../species/_state';

@Component({
  selector: 'app-active-bar',
  templateUrl: './active-bar.component.html',
  styleUrls: ['./active-bar.component.scss'],
})
export class ActiveBarComponent implements OnInit {
  public activeSpeciesActiveAbilities$: Observable<Ability[]>;
  public canActiveAbility$: Observable<boolean>;

  constructor(
    private speciesQuery: SpeciesQuery,
    private abilityService: AbilityService
  ) {}

  ngOnInit(): void {
    this.canActiveAbility$ = this.abilityService.canActiveAbility$;
    this.activeSpeciesActiveAbilities$ =
      this.speciesQuery.activeSpeciesActiveAbilities$;
  }
}
