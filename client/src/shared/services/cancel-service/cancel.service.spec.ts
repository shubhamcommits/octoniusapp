import { TestBed, inject } from '@angular/core/testing';

import { HttpCancelService } from './cancel.service';

describe('HttpCancelService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HttpCancelService]
    });
  });

  it('should be created', inject([HttpCancelService], (service: HttpCancelService) => {
    expect(service).toBeTruthy();
  }));
});
