import { DateTime } from 'luxon';

/**
 * This function is resposible for checking if an object has certain property or not
 * @param object 
 * @param property 
 */
function hasProperty(object: any, property: any) {
    return Object.prototype.hasOwnProperty.call(object, property);
}

function isSameDay(day1: any, day2: any) {
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

/*  =======================
 *  --  HELPER FUNCTIONS --
 *  =======================
 * */
export {
    hasProperty, isSameDay
}