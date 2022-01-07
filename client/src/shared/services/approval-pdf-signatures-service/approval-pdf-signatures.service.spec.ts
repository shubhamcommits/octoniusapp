import { TestBed } from '@angular/core/testing';

import { ApprovalPDFSignaturesService } from './approval-pdf-signatures.service';

describe('ApprovalPDFSignaturesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ApprovalPDFSignaturesService = TestBed.get(ApprovalPDFSignaturesService);
    expect(service).toBeTruthy();
  });
});
