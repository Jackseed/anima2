// Angular
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
// Components
import { MenuComponent } from '../adaptation/menu/menu.component';
// Angular Material
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { TileQuery } from '../tiles/_state';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  isTileActive$: Observable<boolean>;
  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    public dialog: MatDialog,
    private tileQuery: TileQuery
  ) {
    this.matIconRegistry.addSvgIcon(
      'migrate',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/action-buttons/migrate.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'migrate-disable',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/action-buttons/migrate-disable.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'assimilate',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/action-buttons/assimilate.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'assimilate-disable',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/action-buttons/assimilate-disable.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'proliferate',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/action-buttons/proliferate.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'proliferate-disable',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/action-buttons/proliferate-disable.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'adaptation',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/action-buttons/adaptation.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'adaptation-disable',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/action-buttons/adaptation-disable.svg'
      )
    );
  }

  ngOnInit(): void {
    this.isTileActive$ = this.tileQuery.selectActive((tile) => !!tile);
  }

  public openDialog(): void {
    const dialogRef = this.dialog.open(MenuComponent, {
      backdropClass: 'transparent-backdrop',
      panelClass: 'transparent-menu',
      disableClose: true,
      autoFocus: false,
      height: '100%',
      width: '100%',
    });
  }
}
