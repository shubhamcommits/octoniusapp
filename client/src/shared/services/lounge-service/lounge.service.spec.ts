import { TestBed } from '@angular/core/testing';

import { LoungeService } from './lounge.service';

describe('LoungeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LoungeService = TestBed.get(LoungeService);
    expect(service).toBeTruthy();
  });
});
