// Angular
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
// Components
import { AdaptationMenuComponent } from '../abilities/adaptation-menu/adaptation-menu.component';
// Angular Material
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { TileQuery } from '../tiles/_state';
import { Observable, of } from 'rxjs';
import { AssimilationMenuComponent } from '../abilities/assimilation-menu/assimilation-menu.component';
import { GameQuery } from 'src/app/games/_state';
// Rxjs
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  isTileActive$: Observable<boolean>;
  colonizationCount$: Observable<number>;

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    public dialog: MatDialog,
    private tileQuery: TileQuery,
    private gameQuery: GameQuery
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
    this.colonizationCount$ = this.gameQuery
      .selectActive()
      .pipe(map((game) => Number(game.colonizationCount)));
  }

  public openAdaptationMenu(): void {
    this.dialog.open(AdaptationMenuComponent, {
      backdropClass: 'transparent-backdrop',
      panelClass: 'transparent-menu',
      disableClose: true,
      autoFocus: false,
      height: '100%',
      width: '100%',
    });
  }

  public openAssimilationMenu(): void {
    this.dialog.open(AssimilationMenuComponent, {
      data: {
        comp: 'assimilation',
      },
      autoFocus: false,
      backdropClass: 'transparent-backdrop',
      panelClass: 'transparent-menu',
      height: '100%',
      width: '100%',
    });
  }
}
