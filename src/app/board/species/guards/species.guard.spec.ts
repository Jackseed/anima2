import { TestBed } from '@angular/core/testing';

import { SpeciesGuard } from './species.guard';

describe('SpeciesGuard', () => {
  let guard: SpeciesGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(SpeciesGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
