import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UserQuery } from 'src/app/auth/_state';
import { Game, GameQuery } from '../_state';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  public games$: Observable<Game[]>;

  constructor(private userQuery: UserQuery, private gameQuery: GameQuery) {}

  ngOnInit(): void {
    this.games$ = this.gameQuery.selectAll();
  }

  public join(game: Game) {
    const user = this.userQuery.getActive();
    console.log(user);
  }
}
