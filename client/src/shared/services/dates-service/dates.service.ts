import { Injectable, Injector, LOCALE_ID } from "@angular/core";
import { PublicFunctions } from "modules/public.functions";
import { DateTime } from "luxon";

@Injectable({
  providedIn: "root",
})
export class DatesService {
  private publicFunctions = new PublicFunctions(this.injector);

  constructor(private injector: Injector) {}

  ensureDateTime(dateObject: any): DateTime {
    if (!dateObject) return null as any;

    if (DateTime.isDateTime(dateObject)) {
      return dateObject;
    } else if (dateObject instanceof Date) {
      return DateTime.fromJSDate(dateObject);
    } else if (typeof dateObject === "string") {
      return DateTime.fromISO(dateObject);
    } else {
      console.warn("Unknown date format:", dateObject);
      return null as any;
    }
  }

  formateDate(date: any, format?: any) {
    if (!!date) {
      if (date instanceof DateTime) {
        return date
          .setLocale(this.injector.get(LOCALE_ID))
          .toLocaleString(format || DateTime.DATE_MED);
      } else if (date instanceof Date) {
        return DateTime.fromJSDate(date)
          .setLocale(this.injector.get(LOCALE_ID))
          .toLocaleString(format || DateTime.DATE_MED);
      } else {
        return DateTime.fromISO(date)
          .setLocale(this.injector.get(LOCALE_ID))
          .toLocaleString(format || DateTime.DATE_MED);
      }
    }
    return "";
  }

  isBefore(day1: any, day2: any) {
    if (!!day1 && !!day2) {
      if (day1 instanceof DateTime && day2 instanceof DateTime) {
        return day1.startOf("day").toMillis() < day2.startOf("day").toMillis();
      } else {
        return (
          DateTime.fromISO(day1).startOf("day").toMillis() <
          DateTime.fromISO(day2).startOf("day").toMillis()
        );
      }
    } else if ((!day1 && !!day2) || (!!day1 && !day2) || (!day1 && !day2)) {
      return false;
    }
  }

  isWeekend(date: DateTime) {
    if (!!date) {
      let day;
      if (date instanceof DateTime) {
        day = date;
      } else {
        day = DateTime.fromISO(date);
      }

      return !!day && (day.localWeekday == 6 || day.localWeekday == 7);
    }

    return false;
  }

  isSameDay(day1: any, day2: any) {
    if (!!day1 && !!day2) {
      if (day1 instanceof DateTime && day2 instanceof DateTime) {
        return day1.startOf("day").toMillis() == day2.startOf("day").toMillis();
      } else {
        return (
          DateTime.fromISO(day1).startOf("day").toMillis() ==
          DateTime.fromISO(day2).startOf("day").toMillis()
        );
      }
    } else if ((!day1 && !!day2) || (!!day1 && !day2) || (!day1 && !day2)) {
      return false;
    }
  }

  isSameMonth(day1: any, day2: any) {
    if (!!day1 && !!day2) {
      if (day1 instanceof DateTime && day2 instanceof DateTime) {
        return day1.month == day2.month;
      } else {
        return DateTime.fromISO(day1).month == DateTime.fromISO(day2).month;
      }
    } else if ((!day1 && !!day2) || (!!day1 && !day2) || (!day1 && !day2)) {
      return false;
    }
  }

  isCurrentDay(day) {
    let date;
    if (!!day) {
      if (day instanceof DateTime) {
        date = day;
      } else {
        date = DateTime.fromISO(day);
      }
    }

    return !!date && this.isSameDay(date, DateTime.now());
  }
}
