// Angular
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';

// Material
import { MatIconRegistry } from '@angular/material/icon';

// Akita
import { resetStores } from '@datorama/akita';

// States
import { GameService } from '../_state/game.service';
import { MatDialog } from '@angular/material/dialog';

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
    private router: Router,
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

  ngOnInit(): void {}

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
      height: '60%',
      width: '80%',
      panelClass: ['custom-container', 'no-padding-bottom'],
      backdropClass: 'transparent-backdrop',
      autoFocus: false,
    });
  }

  public async startGame() {
    resetStores({ exclude: ['game'] });
    this.gameService
      .createNewGame('')
      .then((gameId: string) => {
        this.router.navigate([`/games/${gameId}`]);
      })
      .catch((error: any) => console.log('Game creation failed: ', error));
  }
}
