// Angular
import { Component, Inject, OnInit } from '@angular/core';

// Material
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

// States
import { Species } from '../../../board/species/_state';
import { TileQuery } from '../../tiles/_state';

export interface dataType {
  listType: 'active' | 'passive';
  species: Species[];
  speciesCount: 'global' | 'tile';
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
  public active: {
    type?: string;
    name?: string;
    icon?: string;
    definition?: string;
  } = {};

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: dataType,
    public dialogRef: MatDialogRef<ListComponent>,
    private snackbar: MatSnackBar,
    private tileQuery: TileQuery
  ) {}

  ngOnInit(): void {}

  // Either returns the global species quantity or the tile species quantity
  public getSpeciesCount(species: Species) {
    if (this.data.speciesCount === 'global') return species.tileIds.length;

    return this.tileQuery.getActiveTileSpeciesCount(species);
  }

  public activate(object: 'ability' | 'specie', i: number) {
    // Activates the selected object and de-activates others.
    if (object === 'ability') {
      this.active = this.abilities[i];
    } else if (object === 'specie') {
      //this.active = this.species[i];
    }
  }

  public close() {
    this.dialogRef.close();
  }

  public validate() {
    this.dialogRef.close();
    this.snackbar.open('Vous avez assimilé !', null, {
      duration: 800,
      panelClass: 'orange-snackbar',
    });
  }
}
