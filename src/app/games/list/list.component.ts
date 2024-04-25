// Angular
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// Akita
import { resetStores } from '@datorama/akita';

// Rxjs
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Material
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

// States
import { Game, GameQuery, GameService } from '../_state';
import { UserQuery } from 'src/app/auth/_state';

// Components
import { FormComponent } from '../form/form.component';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  isScrollable = false;

  public games$: Observable<Game[]>;

  constructor(
    public dialogRef: MatDialogRef<ListComponent>,
    private router: Router,
    private dialog: MatDialog,
    private userQuery: UserQuery,
    private gameQuery: GameQuery,
    private gameService: GameService
  ) {}

  ngOnInit(): void {
    const userId = this.userQuery.getActiveId();
    this.games$ = this.gameQuery.selectAll().pipe(
      map((games) =>
        games.filter(
          (game) =>
            game.playerIds.length === 1 || game.playerIds.includes(userId)
        )
      ),
      map((games) =>
        games.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
      )
    );
    if (this.gameQuery.getCount() > 7) this.isScrollable = true;
  }

  public async join(game: Game) {
    const userId = this.userQuery.getActiveId();
    const isUserAGamePlayer = game.playerIds.includes(userId);
    const isGameFull = this.gameQuery.isGameFull(game.id);

    if (!isUserAGamePlayer && isGameFull) return;

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
    resetStores({ exclude: ['game'] });
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
