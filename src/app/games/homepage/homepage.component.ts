// Angular
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';

// Angular Material
import { MatIconRegistry } from '@angular/material/icon';

// Akita
import { resetStores } from '@datorama/akita';

// States
import { GameService } from '../_state/game.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
})
export class HomepageComponent implements OnInit {
  public menu = [
    {
      cta: 'Partie rapide',
      //func: this.playNow(),
    },
    {
      cta: 'Invitez un joueur',
      //func: this.playNow(),
    },
    {
      cta: 'Règles & tuto',
      //func: this.playNow(),
    },
    {
      cta: 'Compte',
      //func: this.playNow(),
    },
    {
      cta: 'Quittez',
      //func: this.playNow(),
    },
  ];

  constructor(
    private router: Router,
    private gameService: GameService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    this.matIconRegistry.addSvgIcon(
      'adaptation',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        '../../../assets/action-buttons/adaptation.svg'
      )
    );
  }

  ngOnInit(): void {}

  public async startGame() {
    resetStores({ exclude: ['game'] });
    this.gameService
      .createNewGame('')
      .then((gameId) => {
        this.router.navigate([`/games/${gameId}`]);
      })
      .catch((error) => console.log('Neutral creation failed: ', error));
  }
}
