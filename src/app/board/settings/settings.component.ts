// Angular
import { Component, OnInit } from '@angular/core';
// Angular Material
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
  constructor(public dialogRef: MatDialogRef<SettingsComponent>) {}

  ngOnInit(): void {}

  public close() {
    this.dialogRef.close();
  }
}
