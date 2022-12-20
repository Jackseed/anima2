// Angular
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

// Akita
import { resetStores } from '@datorama/akita';

// Material
import { MatDialogRef } from '@angular/material/dialog';

// States
import { GameService } from '../_state';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnInit {
  @ViewChild('gameNameInput') gameNameInput: ElementRef;
  public gameName: string = '';
  public gameId: string;

  constructor(
    public dialogRef: MatDialogRef<FormComponent>,
    private gameService: GameService
  ) {}

  ngOnInit(): void {}

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
