import { TestBed } from '@angular/core/testing';

import { ActiveGameGuard } from './active-game.guard';

describe('ActiveGameGuard', () => {
  let guard: ActiveGameGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(ActiveGameGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
