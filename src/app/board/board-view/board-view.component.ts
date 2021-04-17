import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Tile, TileQuery, TileService } from '../tiles/_state';

@Component({
  selector: 'app-board-view',
  templateUrl: './board-view.component.html',
  styleUrls: ['./board-view.component.scss'],
})
export class BoardViewComponent implements OnInit {
  public tiles$: Observable<Tile[]>;

  constructor(private tileQuery: TileQuery, private tileService: TileService) {}

  ngOnInit(): void {
    this.tileService.setTiles();
    this.tiles$ = this.tileQuery.selectAll();
  }
}
