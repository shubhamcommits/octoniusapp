import { TestBed } from '@angular/core/testing';

import { CollaboraOfficeService } from './collabora-office.service';

describe('CollaboraOfficeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CollaboraOfficeService = TestBed.get(CollaboraOfficeService);
    expect(service).toBeTruthy();
  });
});
