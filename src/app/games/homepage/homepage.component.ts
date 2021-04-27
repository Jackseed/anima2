import { Component, OnInit } from '@angular/core';
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
  constructor(
    private router: Router,
    private gameService: GameService,
    private speciesService: SpeciesService,
    private tileService: TileService
  ) {}

  ngOnInit(): void {}

  public async playNow() {
    resetStores({ exclude: ['game'] });
    const gameId = this.gameService.createNewGame('');
    await this.tileService.setTiles(gameId);
    this.speciesService.setNeutrals(gameId);
    this.router.navigate([`/games/${gameId}`]);
  }
}
