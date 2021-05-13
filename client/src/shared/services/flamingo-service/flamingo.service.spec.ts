import { TestBed } from '@angular/core/testing';

import { FlamingoService } from './flamingo.service';

describe('FlamingoService', () => {
  let service: FlamingoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlamingoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
