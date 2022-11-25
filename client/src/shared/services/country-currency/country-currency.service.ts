import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CountryCurrencyService {

  currencies = [
    { code: 'AFN', name: $localize`:@@countrycurrencyservice.afn:Afghanistan Afghanis - AFN`},
    { code: 'ALL', name: $localize`:@@countrycurrencyservice.all:Albania Leke - ALL`},
    { code: 'DZD', name: $localize`:@@countrycurrencyservice.dzd:Algeria Dinars - DZD`},
    { code: 'ARS', name: $localize`:@@countrycurrencyservice.ars:Argentina Pesos - ARS`},
    { code: 'AUD', name: $localize`:@@countrycurrencyservice.aud:Australia Dollars - AUD`},
    { code: 'BSD', name: $localize`:@@countrycurrencyservice.bsd:Bahamas Dollars - BSD`},
    { code: 'BHD', name: $localize`:@@countrycurrencyservice.bhd:Bahrain Dinars - BHD`},
    { code: 'BDT', name: $localize`:@@countrycurrencyservice.bdt:Bangladesh Taka - BDT`},
    { code: 'BBD', name: $localize`:@@countrycurrencyservice.bbd:Barbados Dollars - BBD`},
    { code: 'BMD', name: $localize`:@@countrycurrencyservice.bmd:Bermuda Dollars - BMD`},
    { code: 'BRL', name: $localize`:@@countrycurrencyservice.brl:Brazil Reais - BRL`},
    { code: 'CAD', name: $localize`:@@countrycurrencyservice.cad:Canada Dollars - CAD`},
    { code: 'XOF', name: $localize`:@@countrycurrencyservice.xof:CFA BCEAO Francs - XOF`},
    { code: 'XAF', name: $localize`:@@countrycurrencyservice.xaf:CFA BEAC Francs - XAF`},
    { code: 'CLP', name: $localize`:@@countrycurrencyservice.clp:Chile Pesos - CLP`},
    { code: 'CNY', name: $localize`:@@countrycurrencyservice.cny:China Yuan Renminbi - CNY`},
    { code: 'COP', name: $localize`:@@countrycurrencyservice.cop:Colombia Pesos - COP`},
    { code: 'XPF', name: $localize`:@@countrycurrencyservice.xpf:CFP Francs - XPF`},
    { code: 'CRC', name: $localize`:@@countrycurrencyservice.crc:Costa Rica Colones - CRC`},
    { code: 'CYP', name: $localize`:@@countrycurrencyservice.cyp:Cyprus Pounds - CYP`},
    { code: 'DOP', name: $localize`:@@countrycurrencyservice.dop:Dominican Republic Pesos - DOP`},
    { code: 'XCD', name: $localize`:@@countrycurrencyservice.xcd:Eastern Caribbean Dollars - XCD`},
    { code: 'EGP', name: $localize`:@@countrycurrencyservice.egp:Egypt Pounds - EGP`},
    { code: 'EEK', name: $localize`:@@countrycurrencyservice.eek:Estonia Krooni - EEK`},
    { code: 'EUR', name: $localize`:@@countryCurrencyService.eur:Euro - EUR`},
    { code: 'FJD', name: $localize`:@@countrycurrencyservice.fjd:Fiji Dollars - FJD`},
    { code: 'FIM', name: $localize`:@@countrycurrencyservice.fim:Finland Markkaa - FIM`},
    { code: 'XAU', name: $localize`:@@countrycurrencyservice.xau:Gold Ounces - XAU`},
    { code: 'GTQ', name: $localize`:@@countrycurrencyservice.gtq:Guatemalan Quetzal - GTQ`},
    { code: 'HKD', name: $localize`:@@countrycurrencyservice.hkd:Hong Kong Dollars - HKD`},
    { code: 'HUF', name: $localize`:@@countrycurrencyservice.huf:Hungary Forint - HUF`},
    { code: 'ISK', name: $localize`:@@countrycurrencyservice.isk:Iceland Kronur - ISK`},
    { code: 'XDR', name: $localize`:@@countrycurrencyservice.xdr:IMF Special Drawing Right - XDR`},
    { code: 'INR', name: $localize`:@@countrycurrencyservice.inr:India Rupees - INR`},
    { code: 'IDR', name: $localize`:@@countrycurrencyservice.idr:Indonesia Rupiahs - IDR`},
    { code: 'IRR', name: $localize`:@@countrycurrencyservice.irr:Iran Rials - IRR`},
    { code: 'IQD', name: $localize`:@@countrycurrencyservice.iqd:Iraq Dinars - IQD`},
    { code: 'IEP', name: $localize`:@@countrycurrencyservice.iep:Ireland Pounds - IEP`},
    { code: 'ILS', name: $localize`:@@countrycurrencyservice.ils:Israel New Shekels - ILS`},
    { code: 'JMD', name: $localize`:@@countrycurrencyservice.jmd:Jamaica Dollars - JMD`},
    { code: 'JPY', name: $localize`:@@countrycurrencyservice.jyp:Japan Yen - JPY`},
    { code: 'JOD', name: $localize`:@@countrycurrencyservice.jod:Jordan Dinars - JOD`},
    { code: 'KES', name: $localize`:@@countrycurrencyservice.kes:Kenya Shillings - KES`},
    { code: 'KWD', name: $localize`:@@countrycurrencyservice.kwd:Kuwait Dinars - KWD`},
    { code: 'LBP', name: $localize`:@@countrycurrencyservice.lbp:Lebanon Pounds - LBP`},
    { code: 'LUF', name: $localize`:@@countrycurrencyservice.luf:Luxembourg Francs - LUF`},
    { code: 'MYR', name: $localize`:@@countrycurrencyservice.myr:Malaysia Ringgits - MYR`},
    { code: 'MTL', name: $localize`:@@countrycurrencyservice.mtl:Malta Liri - MTL`},
    { code: 'MUR', name: $localize`:@@countrycurrencyservice.mur:Mauritius Rupees - MUR`},
    { code: 'MXN', name: $localize`:@@countrycurrencyservice.mxn:Mexico Pesos - MXN`},
    { code: 'MAD', name: $localize`:@@countrycurrencyservice.mad:Morocco Dirhams - MAD`},
    { code: 'NZD', name: $localize`:@@countrycurrencyservice.nzd:New Zealand Dollars - NZD`},
    { code: 'NOK', name: $localize`:@@countrycurrencyservice.nok:Norway Kroner - NOK`},
    { code: 'OMR', name: $localize`:@@countrycurrencyservice.omr:Oman Rials - OMR`},
    { code: 'PKR', name: $localize`:@@countrycurrencyservice.pkr:Pakistan Rupees - PKR`},
    { code: 'XPD', name: $localize`:@@countrycurrencyservice.xpd:Palladium Ounces - XPD`},
    { code: 'PEN', name: $localize`:@@countrycurrencyservice.pen:Peru Nuevos Soles - PEN`},
    { code: 'PHP', name: $localize`:@@countrycurrencyservice.php:Philippines Pesos - PHP`},
    { code: 'XPT', name: $localize`:@@countrycurrencyservice.xpt:Platinum Ounces - XPT`},
    { code: 'PLN', name: $localize`:@@countrycurrencyservice.pln:Poland Zlotych - PLN`},
    { code: 'QAR', name: $localize`:@@countrycurrencyservice.qar:Qatar Riyals - QAR`},
    { code: 'RON', name: $localize`:@@countrycurrencyservice.ron:Romania New Lei - RON`},
    { code: 'ROL', name: $localize`:@@countrycurrencyservice.rol:Romania Lei - ROL`},
    { code: 'RUB', name: $localize`:@@countrycurrencyservice.rub:Russia Rubles - RUB`},
    { code: 'SAR', name: $localize`:@@countrycurrencyservice.sar:Saudi Arabia Riyals - SAR`},
    { code: 'XAG', name: $localize`:@@countrycurrencyservice.xag:Silver Ounces - XAG`},
    { code: 'SGD', name: $localize`:@@countrycurrencyservice.sgd:Singapore Dollars - SGD`},
    { code: 'SKK', name: $localize`:@@countrycurrencyservice.skk:Slovakia Koruny - SKK`},
    { code: 'SIT', name: $localize`:@@countrycurrencyservice.sit:Slovenia Tolars - SIT`},
    { code: 'ZAR', name: $localize`:@@countrycurrencyservice.zar:South Africa Rand - ZAR`},
    { code: 'KRW', name: $localize`:@@countrycurrencyservice.krw:South Korea Won - KRW`},
    { code: 'LKR', name: $localize`:@@countrycurrencyservice.lkr:Sri Lanka Rupees - LKR`},
    { code: 'SDD', name: $localize`:@@countrycurrencyservice.sdd:Sudan Dinars - SDD`},
    { code: 'SEK', name: $localize`:@@countrycurrencyservice.sek:Sweden Kronor - SEK`},
    { code: 'CHF', name: $localize`:@@countrycurrencyservice.chf:Switzerland Francs - CHF`},
    { code: 'TWD', name: $localize`:@@countrycurrencyservice.twd:Taiwan New Dollars - TWD`},
    { code: 'THB', name: $localize`:@@countrycurrencyservice.thb:Thailand Baht - THB`},
    { code: 'TTD', name: $localize`:@@countrycurrencyservice.ttd:Trinidad and Tobago Dollars - TTD`},
    { code: 'TND', name: $localize`:@@countrycurrencyservice.tnd:Tunisia Dinars - TND`},
    { code: 'TRY', name: $localize`:@@countrycurrencyservice.try:Turkey New Lira - TRY`},
    { code: 'AED', name: $localize`:@@countrycurrencyservice.aed:United Arab Emirates Dirhams - AED`},
    { code: 'GBP', name: $localize`:@@countrycurrencyservice.gbp:United Kingdom Pounds - GBP`},
    { code: 'USD', name: $localize`:@@countryCurrencyService.usd:United States Dollars - USD`},
    { code: 'VEB', name: $localize`:@@countrycurrencyservice.veb:Venezuela Bolivares - VEB`},
    { code: 'VND', name: $localize`:@@countrycurrencyservice.vnd:Vietnam Dong - VND`},
    { code: 'ZMK', name: $localize`:@@countrycurrencyservice.zmk:Zambia Kwacha - ZMK`}
  ]

  countries = [
    { code: 'USA', name: $localize`:@@countryCurrencyService.us:United States of America` },
    { code: 'ES', name: $localize`:@@countryCurrencyService.es:Spain` }
  ]

  constructor(private _http: HttpClient) { }

  getCurrencies() {
    return this.currencies;
  }

  getCountries() {
    return this.countries
  }
}
