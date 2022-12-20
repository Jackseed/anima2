// Angular
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

// Akita
import { resetStores } from '@datorama/akita';

// Rxjs
import { Observable } from 'rxjs';

// Material
import { MatDialogRef } from '@angular/material/dialog';

// States
import { GameService } from '../_state';
import { PlayerQuery } from 'src/app/board/players/_state';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnInit {
  @ViewChild('gameNameInput') gameNameInput: ElementRef;
  public gameName: string = '';
  public gameId: string;
  public playerCount$: Observable<number>;

  constructor(
    public dialogRef: MatDialogRef<FormComponent>,
    private gameService: GameService,
    private playerQuery: PlayerQuery
  ) {}

  ngOnInit(): void {
    this.playerCount$ = this.playerQuery.playerCount$;
  }

  ngAfterViewInit() {
    this.gameNameInput?.nativeElement.focus();
  }

  public close() {
    this.dialogRef.close();
  }

  public async createGame() {
    if (!this.gameName) return;
    resetStores({ exclude: ['game'] });
    this.gameService
      .createNewGame(this.gameName)
      .then((gameId: string) => {
        this.gameId = gameId;
      })
      .catch((error: any) => console.log('Game creation failed: ', error));
  }
}
