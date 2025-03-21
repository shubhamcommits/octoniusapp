import { TestBed } from '@angular/core/testing';

import { FolioService } from './folio.service';

describe('FolioService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FolioService = TestBed.get(FolioService);
    expect(service).toBeTruthy();
  });
});
