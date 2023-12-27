import { TestBed } from '@angular/core/testing';

import { CRMGroupService } from './crm-group.service';

describe('CRMGroupService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CRMGroupService = TestBed.get(CRMGroupService);
    expect(service).toBeTruthy();
  });
});
