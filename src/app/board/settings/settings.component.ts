// Angular
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
// Angular Material
import { MatIconRegistry } from '@angular/material/icon';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  public menu = [
    {
      cta: 'Envoyer un emoji',
    },
    {
      cta: 'Demander une pause',
    },
    {
      cta: 'Règles',
    },
    {
      cta: 'Quittez',
    },
  ];
  constructor(
    public dialogRef: MatDialogRef<SettingsComponent>,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    this.matIconRegistry.addSvgIcon(
      'close',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/close-button.svg'
      )
    );
  }

  ngOnInit(): void {}

  public close() {
    this.dialogRef.close();
  }
}
