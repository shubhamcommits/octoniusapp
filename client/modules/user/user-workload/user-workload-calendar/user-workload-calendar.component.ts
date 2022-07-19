import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CalendarEvent, CalendarMonthViewDay, CalendarView, DAYS_OF_WEEK } from 'angular-calendar';
import { WeekViewHourColumn } from 'calendar-utils';
import moment from 'moment/moment';
import { Subject } from 'rxjs';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { UserAvailabilityDayDialogComponent } from '../user-availability-day-dialog/user-availability-day-dialog.component';

@Component({
  selector: 'app-user-workload-calendar',
  templateUrl: './user-workload-calendar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./user-workload-calendar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UserWorkloadCalendarComponent implements OnInit {

  @Input() userId;

  view: CalendarView = CalendarView.Month;
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;

  viewDate: Date = moment().toDate();

  selectedMonthViewDay: CalendarMonthViewDay;

  selectedDayViewDate: Date;

  hourColumns: WeekViewHourColumn[];

  events: CalendarEvent[] = [];

  refresh: Subject<any> = new Subject();

  selectedDays: any = [];
  bookedDays: any = [];
  daysToCancel: any = [];

  constructor(
    private userService: UserService,
    private utilityService: UtilityService,
    public dialog: MatDialog
    ) { }

  async ngOnInit() {
    await this.userService.getOutOfTheOfficeDays(this.userId).then(res => {
      this.bookedDays = res['user']?.out_of_office;
    });

    this.refresh.next();
  }

  dayClicked(day: CalendarMonthViewDay): void {

    // check if the day is already booked, so we will remove it from out of offie days

    const bookedDayIndex = this.bookedDays.findIndex((bookedDay) => moment(moment.utc(bookedDay.date).format('YYYY-MM-DD')).isSame(moment(moment(day.date).format('YYYY-MM-DD')), 'day'));
    if (bookedDayIndex < 0) {
      this.selectedMonthViewDay = day;
      const dateIndex = this.selectedDays.findIndex((selectedDay) => moment(selectedDay.date).isSame(moment(day.date), 'day'));

      if (dateIndex > -1) {
        delete this.selectedMonthViewDay.cssClass;
        this.selectedDays.splice(dateIndex, 1);
      } else {
        this.selectedDays.push(this.selectedMonthViewDay);
        day.cssClass = 'cal-day-selected';
        this.selectedMonthViewDay = day;
      }
    } else {
      this.selectedMonthViewDay = day;
      const dateIndex = this.daysToCancel.findIndex((dayToCancel) => moment(dayToCancel.date).isSame(moment(day.date), 'day'));
      if (dateIndex > -1) {
        this.daysToCancel.splice(dateIndex, 1);
        this.refresh.next();
      } else {
        this.daysToCancel.push(this.selectedMonthViewDay);
        day.cssClass = 'cal-day-cancel-selected';
        this.selectedMonthViewDay = day;
      }
    }
  }

  beforeMonthViewRender({ body }: { body: CalendarMonthViewDay[] }): void {
    body.forEach((day) => {
      const index = this.bookedDays.findIndex((bookedDay) => moment(moment.utc(bookedDay.date).format('YYYY-MM-DD')).isSame(moment(moment(day.date).format('YYYY-MM-DD')), 'day'))
      if (index >= 0) {
        const bookedDay = this.bookedDays[index];
        day.cssClass = this.getDayStyleClass(bookedDay.type);

        day.cssClass += (day.cssClass != '' && bookedDay.approved) ? '-approved' : '';
      }

      const cancelIndex = this.daysToCancel.findIndex((dayToCancel) => moment(dayToCancel.date).isSame(moment(day.date), 'day'));
      if (cancelIndex >= 0) {
        day.cssClass = 'cal-day-cancel-selected';
      }

      const selIndex = this.selectedDays.findIndex((selectedDay) => moment(selectedDay.date).isSame(moment(day.date), 'day'));
      if (selIndex >= 0) {
        day.cssClass = 'cal-day-selected';
      }
    });
  }

  getDayStyleClass(type: string) {
    return (type == 'holidays')
      ? 'cal-day-holidays'
      : ((type == 'personal')
        ? 'cal-day-personal'
        : ((type == 'sick') ? 'cal-day-sick' : ''));
  }

  openDialog(action: string) {
    if (action == 'add') {
      if (this.selectedDays && this.selectedDays.length > 0) {
        const data = {
          selectedDays: this.selectedDays,
          userId: this.userId
        }
        const dialogRef = this.dialog.open(UserAvailabilityDayDialogComponent, {
          minWidth: '20%',
          disableClose: true,
          data: data
        });

        const datesSavedEventSubs = dialogRef.componentInstance.datesSavedEvent.subscribe((data) => {
          this.selectedDays = [];
          data.forEach(day => {
            day.date = moment(day.date).format('YYYY-MM-DD');
            this.bookedDays.push(day);
          });

          this.refresh.next();
        });

        dialogRef.afterClosed().subscribe(result => {
          datesSavedEventSubs.unsubscribe();
        });
      }
    } else if (action == 'remove') {
      if (this.daysToCancel && this.daysToCancel.length > 0) {
        this.utilityService.getConfirmDialogAlert($localize`:@@userWorkloadCalendar.areYouSure:Are you sure?`, $localize`:@@userWorkloadCalendar.dayWillBeCAncelled:By doing this the day will be cancelled!`)
          .then(async (res) => {
            if (res.value) {
              await this.utilityService.asyncNotification($localize`:@@userWorkloadCalendar.pleaseWaitWeCancelDay:Please wait we are cancelling the day...`, new Promise((resolve, reject) => {
                for (let index = 0; index < this.daysToCancel.length; index++) {
                  this.daysToCancel[index].date = moment(this.daysToCancel[index].date).format("YYYY-MM-DD");
                }
                this.userService.saveOutOfTheOfficeDays(this.userId, this.daysToCancel, 'remove').then((res) => {
                  this.daysToCancel.forEach(day => {
                    const index = this.bookedDays.findIndex(bookedDay => moment(moment.utc(bookedDay.date).format("YYYY-MM-DD")).isSame(moment(day.date).format("YYYY-MM-DD"), 'day'));
                    if (index >= 0) {
                      this.bookedDays.splice(index, 1);
                    }
                  });

                  this.daysToCancel = [];
                  this.refresh.next();

                  // Resolve with success
                  resolve(this.utilityService.resolveAsyncPromise($localize`:@@userWorkloadCalendar.dayCancelled:👍 Day/s cancelled!`));
                })
                .catch(() => {
                  reject(this.utilityService.rejectAsyncPromise($localize`:@@userWorkloadCalendar.errorWhileCancellingDay:Error while cancelling the days!`));
                });
              }));
            }
          });
      }
    }
  }

  clearDates() {
    this.selectedDays = [];
    this.daysToCancel = [];
    this.refresh.next();
  }
}
