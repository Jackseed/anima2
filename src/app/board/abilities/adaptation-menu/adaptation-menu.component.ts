// Angular
import { Component, OnInit } from '@angular/core';

// Material
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

// Rxjs
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';

// States
import { PlayerQuery, PlayerService } from '../../players/_state';
import { Ability } from '../../species/_state';

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
    private snackbar: MatSnackBar,
    private playerQuery: PlayerQuery,
    private playerService: PlayerService
  ) {}

  ngOnInit(): void {
    // Either gets the already given choices (in case of reload)
    // or gets random ones.
    this.abilityChoices$ = this.playerQuery.areAbilityChoicesSet$.pipe(
      map((bool) =>
        bool
          ? this.playerQuery.abilityChoices
          : this.playerService.setAbilityChoices(2)
      ),
      first()
    );
  }

  public activate(i: number) {
    const abilities = this.playerQuery.abilityChoices;
    this.activeAbility = abilities[i];
  }

  public close() {
    this.dialogRef.close();
    this.snackbar.open('"Intimidation" obtenue !', null, {
      duration: 800,
      panelClass: 'orange-snackbar',
    });
  }
}
