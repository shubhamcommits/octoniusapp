import { TestBed, inject } from '@angular/core/testing';

import { LoungeModuleAvailableGuard } from './lounge-module-available.guard';

describe('LoungeModuleAvailableGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoungeModuleAvailableGuard]
    });
  });

  it('should ...', inject([LoungeModuleAvailableGuard], (guard: LoungeModuleAvailableGuard) => {
    expect(guard).toBeTruthy();
  }));
});
