// Angular
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
// Angular Material
import { MatDialogRef } from '@angular/material/dialog';
// States
import { GameService } from 'src/app/games/_state';
import { PlayerQuery } from '../players/_state';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  public menu = [
    {
      cta: 'Envoyer un emoji',
    },
    {
      cta: 'Demander une pause',
    },
    {
      cta: 'Règles',
    },
    {
      cta: 'Abandonner',
      action: this.leave.bind(this),
    },
  ];
  constructor(
    public dialogRef: MatDialogRef<SettingsComponent>,
    private router: Router,
    private playerQuery: PlayerQuery,
    private gameService: GameService
  ) {}

  ngOnInit(): void {}

  public close() {
    this.dialogRef.close();
  }

  public async leave() {
    const activePlayerId = this.playerQuery.getActiveId();
    const opponentId = this.playerQuery.getPlayerOpponentId(activePlayerId);
    await this.gameService.updatePlayerVictory(opponentId, true);
    this.close();
  }
}
