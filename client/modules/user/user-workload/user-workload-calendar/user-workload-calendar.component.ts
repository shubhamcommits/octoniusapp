import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CalendarEvent, CalendarMonthViewDay, CalendarView, DAYS_OF_WEEK } from 'angular-calendar';
import { WeekViewHourColumn } from 'calendar-utils';
import moment from 'moment';
import { Subject } from 'rxjs';
import { UserService } from 'src/shared/services/user-service/user.service';
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

  viewDate: Date = new Date();

  selectedMonthViewDay: CalendarMonthViewDay;

  selectedDayViewDate: Date;

  hourColumns: WeekViewHourColumn[];

  events: CalendarEvent[] = [];

  refresh: Subject<any> = new Subject();

  selectedDays: any = [];
  //holidayDays: any = [];
  bookedDays: any = []

  constructor(
    private userService: UserService,
    public dialog: MatDialog
    ) { }

  async ngOnInit() {
    await this.userService.getOutOfTheOfficeDays(this.userId).then(res => {
      this.bookedDays = res['user']?.out_of_office;
    });

    this.refresh.next();
  }

  dayClicked(day: CalendarMonthViewDay): void {

    // if the selected day is already saved it is not allow to select it
    const bookedDayIndex = this.bookedDays.findIndex((bookedDay) => moment(bookedDay.date).isSame(moment(day.date), 'day'));
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
    }
  }

  beforeMonthViewRender({ body }: { body: CalendarMonthViewDay[] }): void {
    body.forEach((day) => {
      const index = this.bookedDays.findIndex((bookedDay) => moment(bookedDay.date).isSame(moment(day.date), 'day'))
      if (index >= 0) {
        const bookedDay = this.bookedDays[index];
        day.cssClass = (bookedDay.type == 'holidays')
          ? 'cal-day-holidays'
          : ((bookedDay.type == 'personal')
            ? 'cal-day-personal'
            : ((bookedDay.type == 'sick') ? 'cal-day-sick' : ''));

        day.cssClass += (day.cssClass != '' && bookedDay.approved) ? '-approved' : '';
      }
    });
  }

  openDialog() {
    const data = {
      selectedDays: this.selectedDays,
      userId: this.userId
    }

    const dialogRef = this.dialog.open(UserAvailabilityDayDialogComponent, {
      width: '15%',
      disableClose: true,
      data: data
    });

    const datesSavedEventSubs = dialogRef.componentInstance.datesSavedEvent.subscribe((data) => {
      data.forEach(day => {
        this.bookedDays.push(day);
      });

      this.refresh.next();
    });

    dialogRef.afterClosed().subscribe(result => {
      datesSavedEventSubs.unsubscribe();
    });
  }

  clearDates() {
    this.selectedDays = [];
    this.refresh.next();
  }
}
