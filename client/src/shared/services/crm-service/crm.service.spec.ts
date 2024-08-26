import { TestBed } from '@angular/core/testing';

import { CRMService } from './crm.service';

describe('CRMService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CRMService = TestBed.get(CRMService);
    expect(service).toBeTruthy();
  });
});
