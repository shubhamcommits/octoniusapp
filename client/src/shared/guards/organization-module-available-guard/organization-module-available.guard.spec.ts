import { TestBed, inject, waitForAsync } from '@angular/core/testing';

import { OrganizationModuleAvailableGuard } from './organization-module-available.guard';

describe('OrganizationModuleAvailableGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OrganizationModuleAvailableGuard]
    });
  });

  it('should ...', inject([OrganizationModuleAvailableGuard], (guard: OrganizationModuleAvailableGuard) => {
    expect(guard).toBeTruthy();
  }));
});
