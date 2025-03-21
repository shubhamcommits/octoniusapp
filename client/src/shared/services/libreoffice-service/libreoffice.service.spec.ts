import { TestBed } from '@angular/core/testing';

import { LibreofficeService } from './libreoffice.service';

describe('LibreofficeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LibreofficeService = TestBed.get(LibreofficeService);
    expect(service).toBeTruthy();
  });
});
