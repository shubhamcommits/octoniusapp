import { TestBed } from '@angular/core/testing';

import { AuthorizationInterceptorService } from './authorization-interceptor.service';

describe('AuthorizationInterceptorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AuthorizationInterceptorService = TestBed.get(AuthorizationInterceptorService);
    expect(service).toBeTruthy();
  });
});
