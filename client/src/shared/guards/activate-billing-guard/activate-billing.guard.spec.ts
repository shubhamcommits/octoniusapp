import { TestBed, inject, waitForAsync } from '@angular/core/testing';

import { ActivateBillingGuard } from './activate-billing.guard';

describe('ActivateBillingGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ActivateBillingGuard]
    });
  });

  it('should ...', inject([ActivateBillingGuard], (guard: ActivateBillingGuard) => {
    expect(guard).toBeTruthy();
  }));
});
