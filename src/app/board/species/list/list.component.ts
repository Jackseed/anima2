// Angular
import { Component, Inject, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
// Material
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  public species = [
    {
      type: 'specie',
      icon: 'specie2',
    },
    {
      type: 'specie',
      icon: 'specie3',
    },
    {
      type: 'specie',
      icon: 'specie4',
    },
    {
      type: 'specie',
      icon: 'specie4',
    },
    {
      type: 'specie',
      icon: 'specie4',
    },

    {
      type: 'specie',
      icon: 'specie4',
    },
  ];
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
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ListComponent>,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private snackbar: MatSnackBar
  ) {
    this.matIconRegistry.addSvgIcon(
      'close',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/menu-buttons/close-button.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'specie1',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../../assets/specie1.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'specie2',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../../assets/specie2.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'specie3',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../../assets/specie3.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'specie4',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../../assets/specie4.svg'
      )
    );

    this.matIconRegistry.addSvgIcon(
      'ability-1',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../../assets/menu-buttons/ability1.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'ability-2',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../../assets/menu-buttons/ability2.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'ability-3',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../../assets/menu-buttons/ability3.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'ability-4',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../../assets/menu-buttons/ability4.svg'
      )
    );

    this.matIconRegistry.addSvgIcon(
      'ability-1-active',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../../assets/menu-buttons/ability1-active.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'ability-2-active',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../../assets/menu-buttons/ability2-active.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'ability-3-active',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../../assets/menu-buttons/ability3-active.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'ability-4-active',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../../assets/menu-buttons/ability4-active.svg'
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

  public activate(object: 'ability' | 'specie', i: number) {
    // Activates the selected object and de-activates others.
    if (object === 'ability') {
      this.active = this.abilities[i];
    } else if (object === 'specie') {
      this.active = this.species[i];
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
