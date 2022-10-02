// Angular
import { Component, OnInit } from '@angular/core';
// Material
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-menu',
  templateUrl: './adaptation-menu.component.html',
  styleUrls: ['./adaptation-menu.component.scss'],
})
export class AdaptationMenuComponent implements OnInit {
  public abilities = [
    {
      name: 'Intimidation',
      img: '/assets/vol.png',
      definition:
        'À la fin une migration, peut déplacer 1 pion adverse se trouvant sur sa case d’1 case.',
      isActive: false,
    },
    {
      name: 'Gigantisme',
      img: '/assets/vol.png',
      definition: 'yi',
      isActive: false,
    },
    {
      name: 'Vol',
      img: '/assets/vol.png',
      definition: 'yu',
      isActive: false,
    },
  ];
  public activeAbility: {
    name: string;
    img: string;
    definition: string;
    isActive: boolean;
  } = {
    name: 'default',
    img: '',
    definition: '',
    isActive: true,
  };

  constructor(
    public dialogRef: MatDialogRef<AdaptationMenuComponent>,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit(): void {}

  public activate(i: number) {
    this.activeAbility = this.abilities[i];
    for (let j = 0; j < 3; j++) {
      j === i
        ? (this.abilities[i].isActive = true)
        : (this.abilities[j].isActive = false);
    }
  }

  public close() {
    this.dialogRef.close();
    this.snackbar.open('"Intimidation" obtenue !', null, {
      duration: 800,
      panelClass: 'orange-snackbar',
    });
  }
}
