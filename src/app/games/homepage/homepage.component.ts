import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { resetStores } from '@datorama/akita';
import { SpeciesService } from 'src/app/board/species/_state';
import { TileService } from 'src/app/board/tiles/_state';
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
    private speciesService: SpeciesService,
    private tileService: TileService,
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

  public async playNow() {
    resetStores({ exclude: ['game'] });
    const gameId = await this.gameService.createNewGame('');
    await this.tileService
      .setTiles(gameId)
      .then(() => {
        this.speciesService.setNeutrals(gameId);
        this.router.navigate([`/games/${gameId}`]);
      })
      .catch((error) => console.log(error));
  }
}
