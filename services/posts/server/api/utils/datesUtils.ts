import { DateTime } from 'luxon';

/**
 * This Function is a boiler plate for sending the error states
 * @param res 
 * @param err 
 * @param message 
 * @param status 
 */
const isSameDay = (day1: any, day2: any) => {
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

const isBefore = (day1: any, day2: any) => {
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

export { isSameDay, isBefore }