import { DateTime } from 'luxon';

export class HolidayService {

    calculateNumDays(userId: string, startDate: DateTime, endDate: DateTime) {
        const start = DateTime.fromISO(startDate);
        const end = DateTime.fromISO(endDate);

        // Calculate the total number of days between the two dates
        const totalDays = end.diff(start, 'days').days + 1; // Adding 1 to include both start and end dates
        
        // Calculate the number of weekends
        let weekends = 0;
        for (let day = start; day <= end; day = day.plus({ days: 1 })) {
            if (day.weekday === 6 || day.weekday === 7) {
                weekends++;
            }
        }
        
        // Calculate the number of weekdays (excluding weekends)
        return totalDays - weekends;
    }
}