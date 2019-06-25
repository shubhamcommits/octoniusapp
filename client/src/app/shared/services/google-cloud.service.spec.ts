import { TestBed, inject } from '@angular/core/testing';

import { GoogleCloudService } from './google-cloud.service';

describe('GoogleCloudService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GoogleCloudService]
    });
  });

  it('should be created', inject([GoogleCloudService], (service: GoogleCloudService) => {
    expect(service).toBeTruthy();
  }));
});
