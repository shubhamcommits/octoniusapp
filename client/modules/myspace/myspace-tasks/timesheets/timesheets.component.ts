import { Component, OnInit, Injector, ViewChild, TemplateRef, Input, OnDestroy } from '@angular/core';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';
import { DateTime } from 'luxon';
import { BehaviorSubject } from 'rxjs';

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

  // IsLoading behavior subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector)

  constructor(
    private userService: UserService,
    private utilityService: UtilityService,
    private injector: Injector,
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
      this.currentDate = this.currentDate.plus({ days: -numDays })
    } else if (type == 'today') {
      this.currentDate = DateTime.now();
    }
    
    this.generateNavDates();
  }

  async generateNavDates() {
    const firstDay = this.currentDate.startOf("week");

    this.dates = await this.getRangeDates(firstDay);

    await this.userService.getUserTimeTrackingEntites(this.userData._id, this.dates[0].toISODate(), this.dates[this.dates.length -1].toISODate()).then(res => {
      this.timeTrackingEntities = res['timeTrackingEntities'];
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

  // isCurrentDay(day) {
  //   return this.isSameDay(day, DateTime.now());
  // }

  // isSameDay(day1: DateTime, day2: DateTime) {
  //   return day1.startOf('day').toMillis() === day2.startOf('day').toMillis();
  // }

  // isWeekend(date) {
  //   var day = date.toFormat('d');
  //   return (day == '6') || (day == '0');
  // }
  
  formateDate(date) {
    return (!!date) ? DateTime.fromISO(date).toLocaleString({ weekday: 'short', day: 'numeric' }) : '';
  }
}
