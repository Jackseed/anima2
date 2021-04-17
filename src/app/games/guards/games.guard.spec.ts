import { TestBed } from '@angular/core/testing';

import { GamesGuard } from './games.guard';

describe('GamesGuard', () => {
  let guard: GamesGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(GamesGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
