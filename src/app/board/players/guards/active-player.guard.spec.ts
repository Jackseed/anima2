import { TestBed } from '@angular/core/testing';

import { ActivePlayerGuard } from './active-player.guard';

describe('ActivePlayerGuard', () => {
  let guard: ActivePlayerGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(ActivePlayerGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
