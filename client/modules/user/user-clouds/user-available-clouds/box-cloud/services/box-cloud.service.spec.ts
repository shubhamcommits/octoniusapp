import { TestBed } from '@angular/core/testing';

import { BoxCloudService } from './box-cloud.service';

describe('BoxCloudService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BoxCloudService = TestBed.get(BoxCloudService);
    expect(service).toBeTruthy();
  });
});
