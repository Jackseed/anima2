// Angular
import { Component, OnInit } from '@angular/core';
// Angular Material
import { MatDialog } from '@angular/material/dialog';
import { SettingsComponent } from '../settings/settings.component';
import { ListComponent } from '../species/list/list.component';
import { ScoreComponent } from '../score/score.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {}

  public openSpeciesList(): void {
    const dialogRef = this.dialog.open(ListComponent, {
      data: {
        comp: 'passive-list',
      },
      height: '90%',
      width: '80%',
      panelClass: ['custom-container', 'no-padding-bottom'],
      autoFocus: false,
    });
  }

  public openScore(): void {
    const dialogRef = this.dialog.open(ScoreComponent, {
      height: '60%',
      panelClass: 'custom-container',
      autoFocus: false,
    });
  }

  public openSettings(): void {
    const dialogRef = this.dialog.open(SettingsComponent, {
      height: '60%',
      panelClass: 'custom-container',
      autoFocus: false,
    });
  }
}
