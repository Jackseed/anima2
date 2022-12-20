// Angular
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// Rxjs
import { Observable } from 'rxjs';

// Material
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

// States
import { Game, GameQuery, GameService } from '../_state';

// Components
import { FormComponent } from '../form/form.component';
import { UserQuery } from 'src/app/auth/_state';

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
    private userQuery: UserQuery,
    private gameQuery: GameQuery,
    private gameService: GameService
  ) {}

  ngOnInit(): void {
    this.games$ = this.gameQuery.selectAll();
  }

  // If the game is full, links to the game; otherwise to the waiting room.
  public join(game: Game) {
    const userId = this.userQuery.getActiveId();
    const isUserAGamePlayer = game.playerIds.includes(userId);
    if (!isUserAGamePlayer) this.gameService.addPlayer(userId, game.id);

    const isGameFull = this.gameQuery.isGameFull(game.id);

    isGameFull ? this.navigateToGame(game.id) : this.openGameForm();
  }

  private navigateToGame(gameId: string) {
    this.close();
    this.router.navigate(['games', gameId]);
  }

  private openGameForm() {
    this.close();
    this.dialog.open(FormComponent, {
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
