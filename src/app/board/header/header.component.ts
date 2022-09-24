// Angular
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
// Angular Material
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { SettingsComponent } from '../settings/settings.component';
import { ListComponent } from '../species/list/list.component';
import { ScoreComponent } from '../score/score.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    public dialog: MatDialog
  ) {
    this.matIconRegistry.addSvgIcon(
      'species-circle',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/menu-buttons/species-circle.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'active-specie',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/menu-buttons/active-specie.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'strategic-view',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/menu-buttons/strategic-view.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'menu-button',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/menu-buttons/close-button.svg'
      )
    );
  }

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
