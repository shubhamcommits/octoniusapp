import moment from "moment";

/**
 * This function is resposible for checking if an object has certain property or not
 * @param object 
 * @param property 
 */
function hasProperty(object: any, property: any) {
    return Object.prototype.hasOwnProperty.call(object, property);
}

function isSameDay(day1: any, day2: any) {
    if (!day1 && !day2) {
        return true;
    } else if ((!!day1 && !day2) || (!!day2 && !day1)) {
        return true;
    }
    return moment.utc(day1).isSame(moment.utc(day2), 'day');
}

/*  =======================
 *  --  HELPER FUNCTIONS --
 *  =======================
 * */
export {
    hasProperty, isSameDay
}