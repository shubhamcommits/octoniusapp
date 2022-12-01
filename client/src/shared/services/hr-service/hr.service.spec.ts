import { TestBed } from '@angular/core/testing';

import { HRService } from './hr.service';

describe('HRService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HRService = TestBed.get(HRService);
    expect(service).toBeTruthy();
  });
});
