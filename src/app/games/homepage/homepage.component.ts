// Angular
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';

// Material
import { MatIconRegistry } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

// States
import { GameService } from '../_state/game.service';

// Components
import { FormComponent } from '../form/form.component';
import { ListComponent } from '../list/list.component';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
})
export class HomepageComponent implements OnInit {
  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private dialog: MatDialog,
    private gameService: GameService
  ) {
    this.matIconRegistry.addSvgIcon(
      'adaptation',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/action-buttons/adaptation.svg'
      )
    );
  }

  ngOnInit(): void {
    this.gameService.removeActive();
  }

  public openGameForm() {
    this.dialog.open(FormComponent, {
      height: '60%',
      width: '80%',
      panelClass: ['custom-container', 'no-padding-bottom'],
      backdropClass: 'transparent-backdrop',
      autoFocus: false,
    });
  }

  public openGameList() {
    this.dialog.open(ListComponent, {
      height: '80%',
      width: '90%',
      panelClass: ['custom-container', 'overflow-hidden'],
      backdropClass: 'transparent-backdrop',
      autoFocus: false,
    });
  }
}
