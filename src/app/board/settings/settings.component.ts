// Angular
import { Component, OnInit } from '@angular/core';
// Angular Material
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

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
      cta: 'Quitter',
      action: this.leave.bind(this),
    },
  ];
  constructor(
    public dialogRef: MatDialogRef<SettingsComponent>,
    private router: Router
  ) {}

  ngOnInit(): void {}

  public close() {
    this.dialogRef.close();
  }

  public leave() {
    this.close();
    this.router.navigate(['/home']);
  }
}
