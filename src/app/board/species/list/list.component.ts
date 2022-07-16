// Angular
import { Component, Inject, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
// Material
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  public species = [
    {
      icon: 'specie1',
    },
    {
      icon: 'specie2',
    },
    {
      icon: 'specie3',
    },
    {
      icon: 'specie4',
    },
  ];
  public abilities = [
    {
      name: 'Intimidation',
      icon: 'ability-1',
      definition:
        'À la fin une colonisation, peut déplacer 1 pion adverse se trouvant sur sa case d’1 case.',
    },
    {
      name: 'Gigantisme',
      icon: 'ability-4',
      definition: 'yi',
    },
    {
      name: 'Vol',
      icon: 'ability-3',
      definition: 'yu',
    },
  ];
  public activeAbility: Object = {};

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ListComponent>,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
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
        '../../../../assets/menu-buttons/ability_1.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'ability-2',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../../assets/menu-buttons/ability-2.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'ability-3',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../../assets/menu-buttons/ability-3.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'ability-4',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../../assets/menu-buttons/ability-4.svg'
      )
    );
  }

  ngOnInit(): void {}

  public activate(i: number) {
    this.activeAbility = this.abilities[i];
  }

  public close() {
    this.dialogRef.close();
  }
}
