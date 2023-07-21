import { TestBed, inject, waitForAsync } from '@angular/core/testing';

import { ActivateInboxGuard } from './activate-inbox.guard';

describe('ActivateInboxGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ActivateInboxGuard]
    });
  });

  it('should ...', inject([ActivateInboxGuard], (guard: ActivateInboxGuard) => {
    expect(guard).toBeTruthy();
  }));
});
