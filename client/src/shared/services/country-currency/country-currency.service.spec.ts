import { TestBed } from '@angular/core/testing';

import { CountryCurrencyService } from './country-currency.service';

describe('CountryCurrencyService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CountryCurrencyService = TestBed.get(CountryCurrencyService);
    expect(service).toBeTruthy();
  });
});
