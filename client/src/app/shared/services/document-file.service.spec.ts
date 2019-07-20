import { TestBed } from '@angular/core/testing';

import { DocumentFileService } from './document-file.service';

describe('DocumentFileService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DocumentFileService = TestBed.get(DocumentFileService);
    expect(service).toBeTruthy();
  });
});
