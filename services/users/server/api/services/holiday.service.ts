import { DateTime, Interval } from 'luxon';
import { User, Entity, Holiday } from '../models';

export class HolidayService {

    async calculateNumDays(userId: string, startDate: any, endDate: any, type: string) {
        const start = DateTime.fromISO(startDate).startOf('day');
        const end = DateTime.fromISO(endDate).startOf('day');

        // Calculate the total number of days between the two dates
        const naturalDays = end.diff(start, 'days').days + 1; // Adding 1 to include both start and end dates
        // const intervalNaturalDays = Interval.fromDateTimes(start, end);
        // const naturalDays = intervalNaturalDays.length('days');

        const user = await User.findById({_id: userId}).select('hr').lean();
        const entity = await Entity.findById({_id: user.hr._entity }).lean();

        const doIndex = (entity.payroll_days_off) ? entity.payroll_days_off.findIndex((dayOff: any) => dayOff.year === start.year) : -1;
        let dayOff;
        if (doIndex >= 0) {
            dayOff = entity.payroll_days_off[doIndex];
        }
        
        // Calculate the number of weekends
        let weekends = 0;
        for (let day = start; day <= end; day = day.plus({ days: 1 })) {
            if (day.weekday === 6 || day.weekday === 7) {
                weekends++;
            }
        }

        let bankHolidays = 0;
        for (let i = 0; i < dayOff.bank_holidays.length; i++) {
            const bh = DateTime.fromISO(dayOff.bank_holidays[i]);
            const interval = Interval.fromDateTimes(start, end);
            if (interval.contains(bh) && bh.weekday != 6) {
                bankHolidays++;
            }
        }
        
        // Calculate the number of weekdays (excluding weekends)
        let totalDays = naturalDays - weekends - bankHolidays;

        const startOfYear = start.startOf('year');
        const endOfYear = start.endOf('year');
        const holidays = await Holiday.find({
                $and: [
                    { _user: userId },
                    { start_date: { $gte: startOfYear, $lte: endOfYear }}
                ]
            }).lean();

        let usedDays = 0;
        for (let i = 0; i < holidays.length; i++) {
            const holiday = holidays[i];
            if (holiday.type === type) {
                usedDays += holiday.num_days;
            }
        }

        const numDaysOff = (type == 'holidays') ? (dayOff.holidays + user.hr.entity_extra_days_off.holidays) :
            (type == 'sick') ? (dayOff.sick + user.hr.entity_extra_days_off.sick) :
                (type == 'personal') ? (dayOff.personal_days + user.hr.entity_extra_days_off.personal_days) : 0;

        if ((totalDays + usedDays) > numDaysOff) {
            return {
                totalDays: -1,
                code: `Exceeded the number of days per year for ${type}.`
            };
        }
console.log({start})
console.log({end})
console.log({totalDays})
console.log({naturalDays})
console.log({weekends})
console.log({bankHolidays})
        if (totalDays % 1 != 0) {
            return {
                totalDays: -1,
                code: `ERROR for ${type}.`
            };
        }

        return {
            totalDays: totalDays
        }
    }
}