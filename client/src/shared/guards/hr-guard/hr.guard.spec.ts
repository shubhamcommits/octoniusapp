import { TestBed, inject, waitForAsync } from '@angular/core/testing';

import { HRGuard } from './hr.guard';

describe('HRGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HRGuard]
    });
  });

  it('should ...', inject([HRGuard], (guard: HRGuard) => {
    expect(guard).toBeTruthy();
  }));
});
