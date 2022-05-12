import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

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
  constructor(
    public dialogRef: MatDialogRef<ListComponent>,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    this.matIconRegistry.addSvgIcon(
      'close',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/close-button.svg'
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
  }

  ngOnInit(): void {}

  public close() {
    this.dialogRef.close();
  }
}
