import { Component, OnInit, Injector, ViewChild, TemplateRef, Input, OnDestroy, Inject } from '@angular/core';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';
import { DateTime, Interval } from 'luxon';
import { BehaviorSubject } from 'rxjs';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { DOCUMENT } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { NewTimeTrackingDialogComponent } from 'src/app/common/shared/new-time-tracking-dialog/new-time-tracking-dialog.component';
import { DatesService } from 'src/shared/services/dates-service/dates.service';

@Component({
  selector: 'app-timesheets',
  templateUrl: './timesheets.component.html',
  styleUrls: ['./timesheets.component.scss']
})
export class TimesheetsComponent implements OnInit, OnDestroy {

  @Input() userData: any;

  timeTrackingEntities = [];

  //date for calendar Nav
  dates: any = [];
  currentDate: any = DateTime.now();
  currentMonth = '';

  // isCurrentWeek = false;

  displayedColumns: string[] = ['task', 'category', 'group', 'day_1', 'day_2', 'day_3', 'day_4', 'day_5', 'day_6', 'day_7'];

  entryTime = '00:00';

  // IsLoading behavior subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector)

  constructor(
    private userService: UserService,
    private groupService: GroupService,
    private utilityService: UtilityService,
    private datesService: DatesService,
    private injector: Injector,
    public dialog: MatDialog,
    @Inject(DOCUMENT) document: Document
  ) { }

  async ngOnInit() {
    // Starts the spinner
    this.isLoading$.next(true);

    this.userData = await this.publicFunctions.getCurrentUser();

    await this.generateNavDates();

    // Stops the spinner and return the value with ngOnInit
    this.isLoading$.next(false);
  }

  ngOnDestroy() {
  }

  changeDates(numDays: number, type: string) {
    if (type == 'add') {
      this.currentDate = this.currentDate.plus({ days: numDays })
    } else if (type == 'sub') {
      this.currentDate = this.currentDate.minus({ days: numDays })
    } else if (type == 'today') {
      this.currentDate = DateTime.now();
    }
    
    this.generateNavDates();
  }

  async generateNavDates() {
    const firstDay = this.currentDate.startOf("week");

    this.dates = await this.getRangeDates(firstDay);

    await this.userService.getUserTimeTrackingEntites(this.userData._id, this.dates[0].toISODate(), this.dates[this.dates.length -1].toISODate()).then(async res => {
      this.timeTrackingEntities = res['timeTrackingEntities'];

      const interval = Interval.fromDateTimes(this.dates[0], this.dates[this.dates.length -1]);
      await this.timeTrackingEntities.forEach(tte => {
        tte.times = tte.times.filter(time => interval.contains(DateTime.fromISO(time.date)));

        this.dates.forEach(date => {
          const index = (!!tte.times) ? tte.times.findIndex(time => this.isSameDay(date, DateTime.fromISO(time.date))) : -1;
          if (index < 0) {
            if (!tte.times) {
              tte.times = [];
            }

            tte.times.push({
              _id: 'octonius_random_' + tte._id + '_' + date.toMillis(),
              date: date,
              hours: '00',
              minutes: '00'
            });
          }
        });
      });

      this.timeTrackingEntities = this.timeTrackingEntities.filter(tte => !!tte.times && tte.times.length > 0);
    });
  }

  getRangeDates(firstDay) {
    // this.isCurrentWeek = false;

    let dates = [];
    for (var i = 0; i < 7; i++) {
      let date = firstDay.plus({ days: i });
      // date.is_current_day = this.isCurrentDay(date);
      // date.is_weekend_day = this.isWeekend(date);
      dates.push(date);

      // if (date.is_current_day) {
      //   this.isCurrentWeek = true;
      // }
    }

    if (this.dates[0]?.month == this.dates[this.dates?.length -1]?.month) {
      this.currentMonth = this.dates[0]?.toFormat('LLLL');
    } else {
      this.currentMonth = this.dates[0]?.toFormat('LLLL') + ' / ' + this.dates[this.dates?.length -1]?.toFormat('LLLL');
    }

    return dates;
  }

  isSameDay(day1: DateTime, day2: DateTime) {
    if (!day1 && !day2) {
      return true;
    } else if ((!!day1 && !day2) || (!!day2 && !day1)) {
      return true;
    }
    return day1.startOf('day').toMillis() === day2.startOf('day').toMillis();
  }

  getTime(times, date) {
    const index = (!!times) ? times.findIndex(tte => this.isSameDay(DateTime.fromISO(tte.date), date)) : -1;
    if (index >= 0) {
      return times[index].hours + ':' + times[index].minutes;
    } else {
      return '00:00';
    }
  }

  getTimeId(times, date) {
    const index = (!!times) ? times.findIndex(tte => this.isSameDay(DateTime.fromISO(tte.date), date)) : -1;
    if (index >= 0) {
      return times[index]._id;
    }
    return '';
  }
  
  formateDate(date) {
    return this.datesService.formateDate(date, { weekday: 'short', day: 'numeric' });
  }

  displayHideInput(id: string) {
    if (document.getElementById('input_' + id).style.display == 'none') {
      document.getElementById('input_' + id).parentElement.style.border = '2px solid #005fd5';
      document.getElementById('input_' + id).style.display = 'block';
      document.getElementById('input_' + id).focus();
      document.getElementById('span_' + id).style.display = 'none';
    } else {
      document.getElementById('input_' + id).parentElement.style.border = '1px solid #0000001f';
      document.getElementById('input_' + id).style.display = 'none';
      document.getElementById('span_' + id).style.display = 'block';
    }
  }

  onTimeInputChange(timeObject: any, tte: any, date: any, timeId: string) {
    this.entryTime = timeObject;

    if (!!this.entryTime) {
      const time = this.entryTime.split(':');
      const entryTimeHours = time[0];
      const entryTimeMinutes = time[1];

      const index = (tte.times) ? tte.times.findIndex(t => this.isSameDay(DateTime.fromISO(t.date), date)) : -1;

      let editedEntity = {
        _id: tte._id,
        _user: this.userData?._id,
        _task: tte._task._id || tte._task,
        _category: tte._category,
        timeId: tte.times[index]._id || '',
        date: date,
        hours: entryTimeHours,
        minutes: entryTimeMinutes,
        comment: tte.times[index].comment || '',
      }

      this.utilityService.asyncNotification($localize`:@@timesheets.pleaseWait:Please wait we are updating the time...`, new Promise((resolve, reject) => {
        this.groupService.editTimeTrackingEntry(editedEntity, 'time')
          .then(async (res: any) => {
            if (!res.error) {
              this.displayHideInput(timeId);

              this.entryTime = '00:00';

              await this.generateNavDates();

              resolve(this.utilityService.resolveAsyncPromise($localize`:@@timesheets.timeEdited:Time Edited!`));
            } else {
              reject(this.utilityService.rejectAsyncPromise($localize`:@@timesheets.unableToEdited:Unable to edit Time!`));
            }
          });
      }))
    } else {
      this.displayHideInput(timeId);
    }
  }

  openAddNewEntryDialog() {
    const data = {
      // userData: this.userData
    };

    const dialogRef = this.dialog.open(NewTimeTrackingDialogComponent, {
      width: '50%',
      height: '50%',
      disableClose: true,
      hasBackdrop: true,
      // data: data,
    });

    const newTimeEventSubs = dialogRef.componentInstance.newTimeEvent.subscribe(async (data) => {
      await this.generateNavDates();
    });

    dialogRef.afterClosed().subscribe(async result => {
      newTimeEventSubs.unsubscribe();
    });
  }
}
