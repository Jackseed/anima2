import { afterNextRender, Component, computed, DestroyRef, ElementRef, inject, input, viewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import Panzoom, { type PanzoomObject } from '@panzoom/panzoom';
import { PLAYABLE_TILE_IDS, tileX, tileY } from '@anima/engine';
import { GameStore } from './game.store';

// Only the rectangle around the island is drawn, starting on an even row so odd rows stay shifted.
const xs = PLAYABLE_TILE_IDS.map(tileX);
const ys = PLAYABLE_TILE_IDS.map(tileY);
const MIN_X = Math.min(...xs);
const MAX_X = Math.max(...xs);
const MIN_Y = Math.min(...ys) - (Math.min(...ys) % 2);
const MAX_Y = Math.max(...ys);
const isVisible = (id: number) => tileX(id) >= MIN_X && tileX(id) <= MAX_X && tileY(id) >= MIN_Y && tileY(id) <= MAX_Y;

// Hexagonal map, drawn as in the 1.x app: inline-block hexagons, odd rows shifted by a floated shape.
@Component({
  selector: 'app-board',
  imports: [MatIcon],
  template: `
    <div class="zoom" #zoom>
      <main [style.--cols]="cols" [style.--rows]="rows">
        <div class="no-font">
          @for (tile of visibleTiles(); track tile.id) {
            <article
              class="hex relative {{ tile.type }}"
              [class.selected]="store.selectedTileId() === tile.id"
              [class.selectable]="store.highlights().has(tile.id)"
              [class.start-choice]="store.pendingStartTileId() === tile.id"
              (click)="store.clickTile(tile.id)"
            >
              @if (tile.occupants.length > 0) {
                <div class="absolute fill grid{{ tile.occupants.length > 5 ? 5 : tile.occupants.length }}">
                  @for (occupant of tile.occupants; track occupant.speciesId; let i = $index) {
                    <div class="tile-container{{ i }}">
                      <div class="species tile{{ i }}" [style.--color]="occupant.colors.primary">
                        <mat-icon class="fill" [svgIcon]="(occupant.abilityId ?? 'hounds') + '-ability'" />
                        <div class="species-quantity" [style.font-size]="quantitySize(occupant.quantity, tile.occupants.length)">
                          {{ occupant.quantity }}
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }
            </article>
          }
        </div>
      </main>
    </div>
  `,
  styleUrl: './board.scss',
})
export class Board {
  protected readonly store = inject(GameStore);
  protected readonly cols = MAX_X - MIN_X + 1;
  protected readonly rows = MAX_Y - MIN_Y + 1;
  protected readonly visibleTiles = computed(() => this.store.tiles().filter((tile) => isVisible(tile.id)));
  readonly zoomLocked = input(false);
  private readonly zoomElement = viewChild.required<ElementRef<HTMLElement>>('zoom');
  private panzoom: PanzoomObject | undefined;

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const element = this.zoomElement().nativeElement;
      this.panzoom = Panzoom(element, { maxScale: 4, minScale: 1, panOnlyWhenZoomed: true });
      // Trackpad pinches arrive as wheel events with ctrlKey; plain scrolling does not zoom.
      const onWheel = (event: WheelEvent) => {
        if (event.ctrlKey) this.panzoom?.zoomWithWheel(event);
      };
      element.parentElement?.addEventListener('wheel', onWheel, { passive: false });
      destroyRef.onDestroy(() => {
        element.parentElement?.removeEventListener('wheel', onWheel);
        this.panzoom?.destroy();
      });
    });
  }

  resetZoom(): void {
    this.panzoom?.reset({ animate: true });
  }

  // Smaller digits when the number or the species sharing the tile would not fit.
  protected quantitySize(quantity: number, occupants: number): string | null {
    if (quantity >= 100 && occupants >= 2) return 'calc(var(--s) * 0.14)';
    if (quantity >= 100) return 'calc(var(--s) * 0.18)';
    if (occupants >= 3 && quantity >= 10) return 'calc(var(--s) * 0.18)';
    return null;
  }
}
