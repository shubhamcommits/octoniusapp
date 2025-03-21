import { TestBed } from '@angular/core/testing';

import { ManagementPortalService } from './management-portal.service';

describe('ManagementPortalService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ManagementPortalService = TestBed.get(ManagementPortalService);
    expect(service).toBeTruthy();
  });
});
