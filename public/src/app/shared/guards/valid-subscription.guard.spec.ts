import { TestBed, async, inject } from '@angular/core/testing';

import { ValidSubscriptionGuard } from './valid-subscription.guard';

describe('ValidSubscriptionGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ValidSubscriptionGuard]
    });
  });

  it('should ...', inject([ValidSubscriptionGuard], (guard: ValidSubscriptionGuard) => {
    expect(guard).toBeTruthy();
  }));
});
