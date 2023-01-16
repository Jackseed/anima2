// Angular
import { Component, Inject, OnInit } from '@angular/core';

// Material
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

// States
import {
  AbilityId,
  Species,
  SpeciesListData,
  TileSpecies,
} from '../../../board/species/_state/species.model';
import { AbilityService } from '../../ability.service';
import { TileQuery } from '../../tiles/_state';

export interface active {
  species: TileSpecies;
  abilityId: string;
  type?: 'ability' | 'species';
}

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  public active: active = {
    species: {},
    abilityId: null,
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: SpeciesListData,
    public dialogRef: MatDialogRef<ListComponent>,
    private snackbar: MatSnackBar,
    private tileQuery: TileQuery,
    private abilityService: AbilityService
  ) {}

  ngOnInit(): void {}

  // Either returns the global species quantity or the tile species quantity
  public getSpeciesCount(species: Species) {
    if (this.data.speciesCount === 'global') return species.tileIds.length;

    return this.tileQuery.getTileSpeciesCount(species.id, this.data.tileId);
  }

  public activate(species: TileSpecies, abilityId?: string) {
    this.active = {
      species,
      abilityId: abilityId ? abilityId : null,
      type: abilityId ? 'ability' : 'species',
    };
  }

  public capitalizeFirstLetter(word: string) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  public getAbilityFrDefinition(abilityId: AbilityId): string {
    return this.abilityService.getAbilityFrDefinition(abilityId);
  }

  public close() {
    this.dialogRef.close();
  }

  public validate() {
    this.dialogRef.close();
    let successMessage: string;
    if (this.data.action === 'assimiler') {
      this.abilityService.assimilate(this.active.species.id, this.data.tileId);
      successMessage = 'Vous avez assimilé !';
    }
    if (this.data.action === 'intimider') {
      this.abilityService.intimidate(this.active.species, this.data.tileId);
      successMessage = 'Vous avez intimidé !';
    }
    this.snackbar.open(successMessage, null, {
      duration: 800,
      panelClass: 'orange-snackbar',
    });
  }
}
