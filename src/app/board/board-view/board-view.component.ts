import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Species, SpeciesQuery } from '../species/_state';
import { Tile, TileQuery, TileService } from '../tiles/_state';

@Component({
  selector: 'app-board-view',
  templateUrl: './board-view.component.html',
  styleUrls: ['./board-view.component.scss'],
})
export class BoardViewComponent implements OnInit {
  public tiles$: Observable<Tile[]>;
  public species$: Observable<Species[]>;

  constructor(
    private tileQuery: TileQuery,
    private tileService: TileService,
    private SpeciesQuery: SpeciesQuery
  ) {}

  ngOnInit(): void {
    this.tileService.setTiles();
    this.tiles$ = this.tileQuery.selectAll();
    this.species$ = this.SpeciesQuery.selectAll();
  }

  public countSpeciesOnTile(speciesTileIds: number[], i: number): number {
    return speciesTileIds.filter((tileId) => tileId === i).length;
  }

  public select(tileId: number) {
    this.tileService.select(tileId);
  }

  public isActive(tileId: number): boolean {
    return this.tileQuery.hasActive(tileId.toString());
  }
}
