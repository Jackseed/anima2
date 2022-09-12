import { Injectable } from '@angular/core';
import { GameQuery } from '../games/_state';
import { TileQuery, TileService } from './tiles/_state';

@Injectable({
  providedIn: 'root',
})
export class PlayService {
  constructor(
    private tileQuery: TileQuery,
    private tileService: TileService,
    private gameQuery: GameQuery
  ) {}

  public startMigration(): void {
    const activeTileId = Number(this.tileQuery.getActiveId());
    const migrationCount = Number(this.gameQuery.migrationCount);
    this.tileService.markAdjacentReachableTiles(activeTileId, migrationCount);
  }
}
