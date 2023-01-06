// Angular
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// AngularFire
import { AngularFireAuth } from '@angular/fire/auth';

// Rxjs
import { Observable } from 'rxjs';

// Material
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

// States
import { Game, GameQuery, GameService } from '../_state';

// Components
import { FormComponent } from '../form/form.component';
import { PlayerService } from 'src/app/board/players/_state';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  public games$: Observable<Game[]>;

  constructor(
    public dialogRef: MatDialogRef<ListComponent>,
    private router: Router,
    private dialog: MatDialog,
    private afAuth: AngularFireAuth,
    private gameQuery: GameQuery,
    private gameService: GameService,
    private playerService: PlayerService
  ) {}

  ngOnInit(): void {
    this.games$ = this.gameQuery.selectAll();
  }

  public async join(game: Game) {
    const userId = (await this.afAuth.currentUser).uid;
    const isUserAGamePlayer = game.playerIds.includes(userId);
    const isGameFull = this.gameQuery.isGameFull(game.id);

    // Links to the game.
    if (isUserAGamePlayer && isGameFull) return this.navigateToGame(game.id);

    // Links to the waiting room.
    if (isUserAGamePlayer) return this.openGameForm(game.id);

    // Adds the player to the game then navigates to it.
    this.gameService.addActiveUserAsPlayer(game.id);
    this.navigateToGame(game.id);
  }

  private navigateToGame(gameId: string) {
    this.close();
    this.router.navigate(['games', gameId]);
  }

  private openGameForm(gameId: string) {
    this.close();
    this.dialog.open(FormComponent, {
      data: {
        gameId,
      },
      height: '60%',
      width: '80%',
      panelClass: ['custom-container', 'no-padding-bottom'],
      backdropClass: 'transparent-backdrop',
      autoFocus: false,
    });
  }

  public close() {
    this.dialogRef.close();
  }
}
