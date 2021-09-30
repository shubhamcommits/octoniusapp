import { TestBed } from '@angular/core/testing';

import { FolioServiceService } from './folio-service.service';

describe('FolioServiceService', () => {
  let service: FolioServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FolioServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
