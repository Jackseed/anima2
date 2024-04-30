// Angular
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

// Material
import { MatIconRegistry } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

// States
import { GameService } from '../_state/game.service';
import { UserService } from 'src/app/auth/_state';

// Components
import { FormComponent } from '../form/form.component';
import { ListComponent } from '../list/list.component';
import { UserViewComponent } from 'src/app/auth/user-view/user-view.component';

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
    private gameService: GameService,
    private userService: UserService
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
  public openUserView() {
    this.dialog.open(UserViewComponent, {
      height: '80%',
      width: '90%',
      panelClass: ['custom-container', 'no-padding-bottom'],
      backdropClass: 'transparent-backdrop',
      autoFocus: false,
    });
  }

  public logOut() {
    this.userService.logOut();
  }
}
