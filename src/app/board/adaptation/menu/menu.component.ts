// Angular
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
// Material
import { MatIconRegistry } from '@angular/material/icon';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  public abilities = [
    {
      name: 'Intimidation',
      img: '/assets/vol.png',
      definition:
        'À la fin une colonisation, peut déplacer 1 pion adverse se trouvant sur sa case d’1 case.',
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
    public dialogRef: MatDialogRef<MenuComponent>,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private snackbar: MatSnackBar
  ) {
    this.matIconRegistry.addSvgIcon(
      'blank',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/menu-buttons/blank-button.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'validate',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/menu-buttons/validate-button.svg'
      )
    );
  }

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
