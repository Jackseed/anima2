import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { MenuComponent } from '../adaptation/menu/menu.component';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    public dialog: MatDialog
  ) {
    this.matIconRegistry.addSvgIcon(
      'migrate',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/migrate.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'migrate-disable',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/migrate-disable.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'assimilate',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/assimilate.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'assimilate-disable',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/assimilate-disable.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'proliferate',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/proliferate.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'proliferate-disable',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/proliferate-disable.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'adaptation',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/adaptation.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'adaptation-disable',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/adaptation-disable.svg'
      )
    );
  }

  ngOnInit(): void {}

  public openDialog(): void {
    const dialogRef = this.dialog.open(MenuComponent, {
      panelClass: 'adaptation-menu',
      autoFocus: false,
    });
  }
}
