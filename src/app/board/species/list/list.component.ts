// Angular
import { Component, Inject, OnInit } from '@angular/core';

// Material
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

// States
import {
  Species,
  SpeciesListData,
} from '../../../board/species/_state/species.model';
import { AbilityService } from '../../ability.service';
import { PlayerQuery } from '../../players/_state';
import { TileQuery } from '../../tiles/_state';

// TODO: refactor this
export interface active extends Species {
  type?: string;
  name?: string;
  icon?: string;
  definition?: string;
}

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  public abilities = [
    {
      type: 'ability',
      name: 'Intimidation',
      icon: 'ability-1',
      activeIcon: 'ability-1-active',
      definition:
        'À la fin une migration, peut déplacer 1 pion adverse se trouvant sur sa case d’1 case.',
    },
    {
      type: 'ability',
      name: 'Gigantisme',
      icon: 'ability-4',
      activeIcon: 'ability-4-active',
      definition: 'yi',
    },
    {
      type: 'ability',
      name: 'Vol',
      icon: 'ability-3',
      activeIcon: 'ability-3-active',
      definition: 'yu',
    },
  ];
  public active: active = {};

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: SpeciesListData,
    public dialogRef: MatDialogRef<ListComponent>,
    private snackbar: MatSnackBar,
    private tileQuery: TileQuery,
    private playerQuery: PlayerQuery,
    private abilityService: AbilityService
  ) {}

  ngOnInit(): void {}

  public getSpeciesColors(
    species: Species,
    color: 'primary' | 'secondary'
  ): string {
    return this.playerQuery.getPlayerSpeciesColors(species.playerId, color);
  }

  // Either returns the global species quantity or the tile species quantity
  public getSpeciesCount(species: Species) {
    if (this.data.speciesCount === 'global') return species.tileIds.length;

    return this.tileQuery.getTileSpeciesCount(species, this.data.tileId);
  }

  public activate(object: 'ability' | 'species', i: number, species?: Species) {
    // Activates the selected object and de-activates others.
    if (object === 'ability') {
      this.active = this.abilities[i];
    } else if (object === 'species') {
      this.active = { ...species, type: 'species' };
    }
  }

  public capitalizeFirstLetter(word: string) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  public close() {
    this.dialogRef.close();
  }

  public validate() {
    this.dialogRef.close();
    let successMessage: string;
    if (this.data.action === 'assimiler') {
      this.abilityService.assimilate(this.active.id, this.data.tileId);
      successMessage = 'Vous avez assimilé !';
    }
    if (this.data.action === 'intimider') {
      successMessage = 'Vous avez intimidé !';
    }
    this.snackbar.open(successMessage, null, {
      duration: 800,
      panelClass: 'orange-snackbar',
    });
  }
}
