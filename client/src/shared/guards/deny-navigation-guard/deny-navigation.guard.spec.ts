import { TestBed, inject, waitForAsync } from '@angular/core/testing';

import { DenyNavigationGuard } from './deny-navigation.guard';

describe('DenyNavigationGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DenyNavigationGuard]
    });
  });

  it('should ...', inject([DenyNavigationGuard], (guard: DenyNavigationGuard) => {
    expect(guard).toBeTruthy();
  }));
});
