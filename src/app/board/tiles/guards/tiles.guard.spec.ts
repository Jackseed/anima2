import { TestBed } from '@angular/core/testing';

import { TilesGuard } from './tiles.guard';

describe('TilesGuard', () => {
  let guard: TilesGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(TilesGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
