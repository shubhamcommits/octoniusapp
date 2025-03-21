import { DateTime } from "luxon";

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
            return (
                day1.startOf("day").toMillis() == day2.startOf("day").toMillis()
            );
        } else {
            return (
                DateTime.fromISO(day1).startOf("day").toMillis() ==
                DateTime.fromISO(day2).startOf("day").toMillis()
            );
        }
    } else if ((!day1 && !!day2) || (!!day1 && !day2) || (!day1 && !day2)) {
        return false;
    }
};

const isBefore = (day1: any, day2: any) => {
    if (!!day1 && !!day2) {
        if (day1 instanceof DateTime && day2 instanceof DateTime) {
            return (
                day1.startOf("day").toMillis() < day2.startOf("day").toMillis()
            );
        } else {
            return (
                DateTime.fromISO(day1).startOf("day").toMillis() <
                DateTime.fromISO(day2).startOf("day").toMillis()
            );
        }
    } else if ((!day1 && !!day2) || (!!day1 && !day2) || (!day1 && !day2)) {
        return false;
    }
};

const ensureDateTime = (dateObject: any): DateTime => {
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
};

export { isSameDay, isBefore, ensureDateTime };
