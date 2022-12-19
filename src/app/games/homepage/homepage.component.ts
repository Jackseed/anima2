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
      cta: 'Créer une partie',
      func: this.startGame,
    },
    {
      cta: 'Rejoindre une partie',
      func: this.startGame,
    },
    {
      cta: 'Règles & tuto',
      func: this.startGame,
    },
    {
      cta: 'Compte',
      func: this.startGame,
    },
    {
      cta: 'Quittez',
      func: this.startGame,
    },
  ];

  constructor(
    // Used in html.
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

  public async startGame(gameService: GameService, router: Router) {
    resetStores({ exclude: ['game'] });
    gameService
      .createNewGame('')
      .then((gameId: string) => {
        router.navigate([`/games/${gameId}`]);
      })
      .catch((error: any) => console.log('Game creation failed: ', error));
  }
}
