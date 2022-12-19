// Angular
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(
    public dialogRef: MatDialogRef<FormComponent>,
    private router: Router,
    private gameService: GameService
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.gameNameInput.nativeElement.focus();
  }

  public close() {
    this.dialogRef.close();
  }

  public async createGame() {
    resetStores({ exclude: ['game'] });
    this.gameService
      .createNewGame(this.gameName)
      .then((gameId: string) => {
        this.dialogRef.close();
        this.router.navigate([`/games/${gameId}`]);
      })
      .catch((error: any) => console.log('Game creation failed: ', error));
  }
}
