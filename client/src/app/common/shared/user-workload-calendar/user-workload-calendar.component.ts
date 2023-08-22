import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, Input, Injector } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CalendarEvent, CalendarMonthViewDay, CalendarView, DAYS_OF_WEEK } from 'angular-calendar';
import { WeekViewHourColumn } from 'calendar-utils';
import { PublicFunctions } from 'modules/public.functions';
import { Subject } from 'rxjs';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
// import { UserAvailabilityDayDialogComponent } from './user-availability-day-dialog/user-availability-day-dialog.component';
// import moment from 'moment/moment';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-user-workload-calendar',
  templateUrl: './user-workload-calendar.component.html',
  styleUrls: ['./user-workload-calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class UserWorkloadCalendarComponent implements OnInit {

  @Input() userId;

  userData;
  isCurrentUser = false;
  workspaceData;

  view: CalendarView = CalendarView.Month;
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;

  viewDate: Date = DateTime.now().toJSDate();

  selectedMonthViewDay: CalendarMonthViewDay;

  selectedDayViewDate: Date;

  hourColumns: WeekViewHourColumn[];

  events: CalendarEvent[] = [];

  refresh: Subject<any> = new Subject();

  selectedDays: any = [];
  startDate;
  endDate;
  holidaysInMonth: any = [];
  holidaysInYear: any = [];
  bookedDays: any = [];
  daysToCancel: any = [];

  createNewHoliday = false;
  outOfOfficeReason = ['Holidays', 'Sick', 'Personal day'];
  newHoliday = {
    _id: '',
    start_date: DateTime.now(),
    end_date: DateTime.now(),
    type: '',
    num_days: 0,
    approval_flow: {
      _manager: ''
    }
  }

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private userService: UserService,
    private utilityService: UtilityService,
    private injector: Injector,
    public dialog: MatDialog
    ) { }

  async ngOnInit() {
    this.userData = await this.publicFunctions.getCurrentUser();
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    this.isCurrentUser = (this.userData._id == this.userId);

    const today = DateTime.now();
    const firstDay = today.startOf('month');
    const lastDay = today.endOf('month');
    await this.getOutOfOfficeDays(firstDay.toISO(), lastDay.toISO());

    this.refresh.next();
  }

  // dayClicked(day: CalendarMonthViewDay): void {

  //   // check if the day is already booked, so we will remove it from out of offie days
  //   if (this.isCurrentUser) {
  //     // this.selectedMonthViewDay = day;
  //     // if (!this.startDate) {
  //     //   this.startDate = day.date;
  //     // } else {
  //     //   if (day.date >= this.startDate) {
  //     //     this.endDate = day.date;
  //     //   } else {
  //     //     this.endDate = this.startDate;
  //     //     this.startDate = day.date;
  //     //   }
  //     // }

  //     const bookedDayIndex = this.bookedDays.findIndex((bookedDay) => moment(moment.utc(bookedDay.date).format('YYYY-MM-DD')).isSame(moment(moment(day.date).format('YYYY-MM-DD')), 'day'));
  //     if (bookedDayIndex < 0) {
  //       this.selectedMonthViewDay = day;
  //       const dateIndex = this.selectedDays.findIndex((selectedDay) => moment(selectedDay.date).isSame(moment(day.date), 'day'));

  //       if (dateIndex > -1) {
  //         delete this.selectedMonthViewDay.cssClass;
  //         this.selectedDays.splice(dateIndex, 1);
  //       } else {
  //         this.selectedDays.push(this.selectedMonthViewDay);
  //         day.cssClass = 'cal-day-selected';
  //         this.selectedMonthViewDay = day;
  //       }
  //     } else {
  //       this.selectedMonthViewDay = day;
  //       const dateIndex = this.daysToCancel.findIndex((dayToCancel) => moment(dayToCancel.date).isSame(moment(day.date), 'day'));
  //       if (dateIndex > -1) {
  //         this.daysToCancel.splice(dateIndex, 1);
  //         this.refresh.next();
  //       } else {
  //         this.daysToCancel.push(this.selectedMonthViewDay);
  //         day.cssClass = 'cal-day-cancel-selected';
  //         this.selectedMonthViewDay = day;
  //       }
  //     }
  //   }
  // }

  async beforeMonthViewRender({ body }: { body: CalendarMonthViewDay[] }): Promise<void> {
    await this.getOutOfOfficeDays(body[0].date, body[body.length - 1].date);
// console.log(this.bookedDays);
    body.forEach((day) => {
      const index = this.bookedDays.findIndex((bookedDay) => DateTime.fromJSDate(bookedDay.date).equals(DateTime.fromJSDate(day.date)));
      if (index >= 0) {
        const bookedDay = this.bookedDays[index];
// console.log(bookedDay);
        day.cssClass = this.getDayStyleClass(bookedDay.type);
        day.cssClass += (day.cssClass != '' && bookedDay.approved) ? '-approved' : '';
// console.log(day);
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

  async getOutOfOfficeDays(from: any, to: any) {
    await this.userService.getOutOfTheOfficeDays(this.userId, from, to).then(res => {
      this.holidaysInMonth = res['holidaysInMonth'];
      this.holidaysInYear = res['holidaysInYear'];
    });

    this.bookedDays = [];
    for (let i = 0; i < this.holidaysInMonth.length; i++) {
      const holiday = this.holidaysInMonth[i];
      var date = DateTime.fromISO(holiday.start_date).startOf('day');
      while (date < DateTime.fromISO(holiday.end_date)) {
        const index = this.bookedDays.findIndex((bookedDay) => DateTime.fromJSDate(bookedDay.date).equals(date))
        if (index < 0) {
          this.bookedDays.push({
            date: date.toJSDate(),
            type: holiday.type || 'holidays',
            approved: holiday?.approval_flow?.confirmed || false
          });
        }
        date = date.plus({ days: 1 });
      }
    }
  }

  // openDialog(action: string) {
  //   if (action == 'add') {
  //     if (this.selectedDays && this.selectedDays.length > 0) {
  //       const data = {
  //         selectedDays: this.selectedDays,
  //         startDate: this.startDate,
  //         endDate: this.endDate,
  //         userId: this.userId
  //       }
  //       const dialogRef = this.dialog.open(UserAvailabilityDayDialogComponent, {
  //         minWidth: '20%',
  //         disableClose: true,
  //         hasBackdrop: true,
  //         data: data
  //       });

  //       const datesSavedEventSubs = dialogRef.componentInstance.datesSavedEvent.subscribe((data) => {
  //         this.selectedDays = [];
  //         data.forEach(day => {
  //           day.date = moment(day.date).format('YYYY-MM-DD');
  //           this.bookedDays.push(day);
  //         });

  //         this.refresh.next();
  //       });

  //       dialogRef.afterClosed().subscribe(result => {
  //         datesSavedEventSubs.unsubscribe();
  //       });
  //     }
  //   } else if (action == 'remove') {
  //     if (this.daysToCancel && this.daysToCancel.length > 0) {
  //       this.utilityService.getConfirmDialogAlert($localize`:@@userWorkloadCalendar.areYouSure:Are you sure?`, $localize`:@@userWorkloadCalendar.dayWillBeCAncelled:By doing this the day will be cancelled!`)
  //         .then(async (res) => {
  //           if (res.value) {
  //             await this.utilityService.asyncNotification($localize`:@@userWorkloadCalendar.pleaseWaitWeCancelDay:Please wait we are cancelling the day...`, new Promise((resolve, reject) => {
  //               for (let index = 0; index < this.daysToCancel.length; index++) {
  //                 this.daysToCancel[index].date = moment(this.daysToCancel[index].date).format("YYYY-MM-DD");
  //               }
  //               this.userService.saveOutOfTheOfficeDays(this.userId, this.daysToCancel, 'remove').then((res) => {
  //                 this.daysToCancel.forEach(day => {
  //                   const index = this.bookedDays.findIndex(bookedDay => moment(moment.utc(bookedDay.date).format("YYYY-MM-DD")).isSame(moment(day.date).format("YYYY-MM-DD"), 'day'));
  //                   if (index >= 0) {
  //                     this.bookedDays.splice(index, 1);
  //                   }
  //                 });

  //                 this.daysToCancel = [];
  //                 this.refresh.next();

  //                 // Resolve with success
  //                 resolve(this.utilityService.resolveAsyncPromise($localize`:@@userWorkloadCalendar.dayCancelled:👍 Day/s cancelled!`));
  //               })
  //               .catch(() => {
  //                 reject(this.utilityService.rejectAsyncPromise($localize`:@@userWorkloadCalendar.errorWhileCancellingDay:Error while cancelling the days!`));
  //               });
  //             }));
  //           }
  //         });
  //     }
  //   }
  // }

  showNewHolidayForm() {
    this.createNewHoliday = true;
  }

  cancelHoliday() {
    this.newHoliday = {
      _id: '',
      start_date: DateTime.now(),
      end_date: DateTime.now(),
      type: '',
      num_days: 0,
      approval_flow: {
        _manager: ''
      }
    };

    this.createNewHoliday = false;
  }

  editHolidays(holiday: any) {
    this.newHoliday._id = holiday._id;
    this.newHoliday.start_date = holiday.start_date;
    this.newHoliday.end_date = holiday.end_date;
    this.newHoliday.type = holiday.type;
    this.newHoliday.num_days = holiday.num_days;
    this.newHoliday.approval_flow._manager = holiday.approval_flow._manager;

    this.showNewHolidayForm();
  }

  saveDayOff() {
    this.utilityService.asyncNotification($localize`:@@userWorkloadCalendar.plesaeWaitWeAreUpdaing:Please wait we are updating the entity...`, new Promise((resolve, reject) => {
      if (this.newHoliday?._id && this.newHoliday?._id != '') {
        this.userService.editHoliday(this.userData?._id, this.newHoliday).then(res => {
          const index = (this.holidaysInYear) ? this.holidaysInYear.findIndex(hol => hol._id == this.newHoliday._id) : -1;
          if (index >= 0) {
            this.holidaysInYear[index] = this.newHoliday;
          }

          this.cancelHoliday();

          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@userWorkloadCalendar.holidayUpdated:Holiday updated!`));
        })
        .catch(() => {
          this.cancelHoliday();

          reject(this.utilityService.rejectAsyncPromise($localize`:@@userWorkloadCalendar.unableToUpdateHoliday:Unable to update the holiday, please try again!`));
        });
      } else {
        this.userService.createHoliday(this.userData?._id, this.newHoliday).then(res => {
          this.holidaysInYear.push(res['holiday']);
          this.cancelHoliday();

          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@userWorkloadCalendar.holidayCreated:Holiday created!`));
        })
        .catch((error) => {
          this.cancelHoliday();
          reject(this.utilityService.rejectAsyncPromise(error.error.message));
        });
      }
    }));
  }

  removeHolidays(holidayId: string) {
    this.utilityService.getConfirmDialogAlert($localize`:@@userWorkloadCalendar.areYouSure:Are you sure?`, $localize`:@@userWorkloadCalendar.completelyRemoved:By doing this, the year will be completely removed!`)
      .then((res) => {
        if (res.value) {
          this.utilityService.asyncNotification($localize`:@@userWorkloadCalendar.pleaseWaitDeleting:Please wait we are deleting the holiday...`, new Promise((resolve, reject) => {
            this.userService.deleteHoliday(holidayId).then(res => {
              const index = (this.holidaysInYear) ? this.holidaysInYear.findIndex(hol => hol._id == this.newHoliday._id) : -1;
              if (index >= 0) {
                this.holidaysInYear.splice(index, 1);
              }

              resolve(this.utilityService.resolveAsyncPromise($localize`:@@userWorkloadCalendar.deleted:Holiday deleted!`));
            }).catch((err) => {
              reject(this.utilityService.rejectAsyncPromise($localize`:@@userWorkloadCalendar.unableDeleteHoliday:Unable to delete the holiday, please try again!`));
            });
          }));
        }
      });
  }

  calculateNumHolidays() {
    this.userService.getNumHolidays(this.userData?._id, this.newHoliday.start_date, this.newHoliday.end_date).then(res => {
      this.newHoliday.num_days = res['numDays'];
    });
  }

  selectManager(user: any) {
    this.newHoliday.approval_flow._manager = user;
  }

  canCreate() {
    return !!this.newHoliday.approval_flow._manager
      && !!this.newHoliday.type
      && !!this.newHoliday.start_date
      && !!this.newHoliday.end_date
  }

  // clearDates() {
  //   this.selectedDays = [];
  //   this.daysToCancel = [];
  //   this.refresh.next();
  // }

  formateDate(date: any) {
    return (date) ? DateTime.fromISO(date).toLocaleString(DateTime.DATE_SHORT) : '';
  }
}
