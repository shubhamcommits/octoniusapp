import { TestBed } from '@angular/core/testing';

import { MS365CloudService } from './ms-365-cloud.service';

describe('MS365CloudService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MS365CloudService = TestBed.get(MS365CloudService);
    expect(service).toBeTruthy();
  });
});
