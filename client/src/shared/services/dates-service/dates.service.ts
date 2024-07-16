import { Injectable, Injector, LOCALE_ID } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { DateTime } from 'luxon';

@Injectable({
  providedIn: 'root'
})
export class DatesService {

  private publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private injector: Injector
    ) { }

  formateDate(date: any, format?: any) {
    if (!!date) {
      if (date instanceof DateTime) {
        return date.setLocale(this.injector.get(LOCALE_ID)).toLocaleString(format || DateTime.DATE_MED);
      } else if (date instanceof Date) {
        return DateTime.fromJSDate(date).setLocale(this.injector.get(LOCALE_ID)).toLocaleString(format || DateTime.DATE_MED);
      } else  {
        return DateTime.fromISO(date).setLocale(this.injector.get(LOCALE_ID)).toLocaleString(format || DateTime.DATE_MED);
      }
    }
    return '';
  }

  isBefore(day1: any, day2: any) {
    if (!!day1 && !!day2) {
      if (day1 instanceof DateTime && day2 instanceof DateTime) {
        return day1.startOf('day').toMillis() < day2.startOf('day').toMillis();
      } else {
        return DateTime.fromISO(day1).startOf('day').toMillis() < DateTime.fromISO(day2).startOf('day').toMillis();
      }
    } else if ((!day1 && !!day2) || (!!day1 && !day2) || (!day1 && !day2)) {
      return false;
    }
  }

  isWeekend(date: DateTime) {
    var day = date.toFormat('d');
    return (day == '6') || (day == '0');
  }

  isSameDay(day1: any, day2: any) {
    if (!!day1 && !!day2) {
      if (day1 instanceof DateTime && day2 instanceof DateTime) {
        return day1.startOf('day').toMillis() == day2.startOf('day').toMillis();
      } else {
        return DateTime.fromISO(day1).startOf('day').toMillis() == DateTime.fromISO(day2).startOf('day').toMillis();
      }
    } else if ((!day1 && !!day2) || (!!day1 && !day2) || (!day1 && !day2)) {
      return false;
    }
  }
}
