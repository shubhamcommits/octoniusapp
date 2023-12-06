import { Component, OnInit, Input, Output, EventEmitter, ViewChildren, AfterViewInit } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';
import { CountryCurrencyService } from 'src/shared/services/country-currency/country-currency.service';

@Component({
  selector: 'app-country-select',
  templateUrl: './country-select.component.html',
  styleUrls: ['./country-select.component.scss']
})
export class CountrySelectComponent implements OnInit {

  @Input() countryCode: string = '';
  @Input() canEdit: boolean = true;

  @ViewChildren('countryFilter') countryFilter;

  // OUTPUT EMAIL EMITTER
  @Output() countrySelected = new EventEmitter();

  countries = [];
  filteredCountries = [];
  constructor(
    private utilityService: UtilityService,
    private countryCurrencyService: CountryCurrencyService
  ) { }

  ngOnInit() {
    this.countries = this.countryCurrencyService.getCountries();
    this.filteredCountries = this.countries;
  }
  
  ngOnDestroy(): void {
    this.utilityService.clearAllNotifications();
  }

  onOpened() {
    this.countryFilter.first.nativeElement.focus();
  }

  changeCountry(value: any) {
    if (value) {
      this.countrySelected.emit(value);
    }
  }

  onCountrySearch(value: string) { 
    this.filteredCountries = this.countries.filter(c => c.name.toLowerCase().includes(value.toLowerCase()));
  }
}
