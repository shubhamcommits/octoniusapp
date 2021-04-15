import { TestBed } from '@angular/core/testing';

import { ManageHttpInterceptor } from './manage-http-interceptor.service';

describe('ManageHttpInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ManageHttpInterceptor = TestBed.get(ManageHttpInterceptor);
    expect(service).toBeTruthy();
  });
});
