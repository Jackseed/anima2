// Angular
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';

// Akita
import { resetStores } from '@datorama/akita';

// Rxjs
import { Observable, Subscription } from 'rxjs';

// Material
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

// States
import { GameQuery, GameService } from '../_state';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('gameNameInput') gameNameInput: ElementRef;
  public gameName: string = '';
  public gameId: string;
  public playerCount$: Observable<number>;
  private gameFullSub: Subscription;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { gameId: string },
    public dialogRef: MatDialogRef<FormComponent>,
    private gameQuery: GameQuery,
    private gameService: GameService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.data?.gameId) this.gameId = this.data.gameId;
    this.playerCount$ = this.gameQuery.playerCount$;
    this.gameFullSub = this.gameQuery.isGameFull$.subscribe((isGameFull) => {
      if (isGameFull) this.navigateToGame(this.gameId);
    });
  }

  ngAfterViewInit() {
    this.gameNameInput?.nativeElement.focus();
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

  private navigateToGame(gameId: string) {
    this.close();
    this.router.navigate(['games', gameId]);
  }

  public close() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.gameFullSub.unsubscribe();
  }
}
