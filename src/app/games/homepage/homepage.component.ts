import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../_state/game.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
})
export class HomepageComponent implements OnInit {
  constructor(private router: Router, private gameService: GameService) {}

  ngOnInit(): void {}

  public async playNow() {
    const gameId = this.gameService.createNewGame('');
    this.router.navigate([`/games/${gameId}`]);
  }
}
