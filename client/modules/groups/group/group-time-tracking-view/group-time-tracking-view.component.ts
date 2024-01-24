import { Component, OnInit, Injector, Input, OnChanges, SimpleChanges, OnDestroy, LOCALE_ID } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { DateTime, Interval } from 'luxon';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { NewTimeTrackingDialogComponent } from 'src/app/common/shared/new-time-tracking-dialog/new-time-tracking-dialog.component';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-group-time-tracking-view',
  templateUrl: './group-time-tracking-view.component.html',
  styleUrls: ['./group-time-tracking-view.component.scss']
})
export class GroupTimeTrackingViewComponent implements OnInit, OnChanges, OnDestroy {

  @Input() startDate: any;
  @Input() endDate: any;
  @Input() filterUserId: any;
  
  groupData: any;
  userData: any;

  timeTrackingEntities = [];
  timeTrackingEntitiesMapped = [];
  dataSource = [];

  //date for calendar Nav
  dates: any = [];
  currentDate: any = DateTime.now();
  currentMonth = '';
  periodView = "week";

  reducedGroups = [];

  // isCurrentWeek = false;

  displayedColumns: string[] = ['task', 'time', 'date', 'category', 'comment'/*, 'star'*/];

  entryTime = '00:00';

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  constructor(
    private groupService: GroupService,
    private utilityService: UtilityService,
    private injector: Injector,
    public dialog: MatDialog
  ) { }

  async ngOnInit() {
    await this.initView();
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (!!changes.startDate && !!changes.startDate.currentValue) {
      this.startDate = changes.startDate.currentValue;
    }

    if (!!changes.endDate && !!changes.endDate.currentValue) {
      this.endDate = changes.endDate.currentValue;
    }

    if (!!changes.filterUserData && !!changes.filterUserData.currentValue) {
      this.filterUserId = changes.filterUserData.currentValue;
    }

    await this.initView();
  }

  ngOnDestroy() {
  }

  async initView() {
    // Starts the spinner
    this.isLoading$.next(true);

    this.userData = await this.publicFunctions.getCurrentUser();
    this.groupData = await this.publicFunctions.getCurrentGroupDetails();

    await this.generateNavDates(false);

    // Return the function via stopping the loader
    return this.isLoading$.next(false);
  }

  async generateNavDates(change: boolean) {
    await this.getFirstDay(change);
    await this.getLastDay(change);

    await this.groupService.getGroupTimeTrackingEntites(this.groupData._id, this.startDate, this.endDate, this.filterUserId).then(async res => {
      this.timeTrackingEntities = res['timeTrackingEntities'];
      this.timeTrackingEntities = this.timeTrackingEntities.filter(tte => !!tte.times && tte.times.length > 0);
    });
    
    await this.initTable();
  }
  
	async initTable() {
    this.timeTrackingEntitiesMapped = [];
    const interval = Interval.fromDateTimes(this.startDate, this.endDate);
    this.timeTrackingEntities.forEach(tte => {
      tte?.times?.forEach(time => {
        let tteMapped = {
          _id: tte._id,
          _user: tte._user,
          _task: tte._task,
          _category: tte._category,
          timeId: time._id,
          date: time.date,
          hours: time.hours,
          minutes: time.minutes,
          comment: time.comment,
        };

        this.timeTrackingEntitiesMapped.push(tteMapped);
      });
    });
    this.timeTrackingEntitiesMapped = [...this.timeTrackingEntitiesMapped];
    this.timeTrackingEntities = this.timeTrackingEntitiesMapped.filter(tte => tte.hours !== '00' && tte.minutes !== '00' && interval.contains(DateTime.fromISO(tte.date)));

    this.buildDataSource();
	}

  buildDataSource() {
    this.dataSource = this.groupBy(this.timeTrackingEntities, this.reducedGroups);
console.log("timeTrackingEntitiesMapped: ", this.timeTrackingEntitiesMapped);
console.log("dataSource: ", this.dataSource);
  }

  groupBy(data: any[], reducedGroups?: any[]){
    let collapsedGroups = reducedGroups;
    if(!reducedGroups) collapsedGroups = [];

    let groups = data.reduce((accumulator, currentValue) => {
        let currentGroup = currentValue._user;
        const userNumbers: any = this.getUserTotalNumbers(currentValue?._user?._id);
        if(!accumulator[currentGroup._id]) {
          accumulator[currentGroup._id] = [{
            userName: `${currentValue?._user?.first_name} ${currentValue?._user?.last_name}`,
            _user: currentValue?._user,
            totalTasks: userNumbers.totalTasks,
            totalHours: userNumbers.totalHours,
            totalMinutes: userNumbers.totalMinutes,
            isGroup: true,
            reduced: collapsedGroups.some((group) => group._user._id == currentValue?._user._id)
          }];
        }

        accumulator[currentGroup._id].push(currentValue);
        accumulator[currentGroup._id] = accumulator[currentGroup._id].sort((a, b) => {
          return this.utilityService.compare(a.date, b.date, 1);
        });
        return accumulator;
      }, {});

    let groupArray = Object.keys(groups).map(key => groups[key]);
    let flatList = groupArray.reduce((a,c) => { return a.concat(c); }, []);

    return flatList.filter((rawLine) => {
      return rawLine.isGroup || collapsedGroups.every((group) => rawLine?._user?._id != group?._user?._id);
    });
  }

  getUserTotalNumbers(userId: string) {
    // Create an object to store the total hours, minutes, and tasks for each user
    const userTotals = {};

    // Iterate through the array
    this.timeTrackingEntitiesMapped.forEach(tte => {
      const entryUserId = tte._user._id;

      // Skip entries for other users
      if (entryUserId !== userId) {
        return;
      }

      // Initialize totals for the user if not present
      if (!userTotals[userId]) {
        userTotals[userId] = { hours: 0, minutes: 0, tasks: new Set() };
      }

      // Add the hours and minutes from the current entry
      userTotals[userId].hours += parseInt(tte.hours);
      userTotals[userId].minutes += parseInt(tte.minutes);

      // Add the task to the set for counting unique tasks
      userTotals[userId].tasks.add(tte._task._id);
    });

    // Convert excess minutes to hours if necessary
    const { hours, minutes } = userTotals[userId];
    const extraHours = Math.floor(minutes / 60);

    userTotals[userId].hours += extraHours;
    userTotals[userId].minutes %= 60;
console.log("userTotals: ", userTotals);
    // Return an object with the total hours, minutes, and tasks for the specified user
    return {
      totalHours: userTotals[userId].hours,
      totalMinutes: userTotals[userId].minutes,
      totalTasks: userTotals[userId].tasks.size,
    };
  }

  /**
   * Since groups are on the same level as the data, 
   * this function is used by @input(matRowDefWhen)
   */
  isGroup(index, item): boolean{
    return item.isGroup;
  }

  /**
   * Used in the view to collapse a group
   * Effectively removing it from the displayed datasource
   */
  reduceGroup(row){
    row.reduced=!row.reduced;
    if(row.reduced) {
      this.reducedGroups.push(row);
    } else {
      this.reducedGroups = this.reducedGroups.filter((el)=>el.value!=row.value);
    }
    
    this.buildDataSource();
  }

  changeDates(type: string) {
    if (this.periodView == 'week') {
      if (type == 'add') {
        this.currentDate = this.currentDate.plus({ days: 7 })
      } else if (type == 'sub') {
        this.currentDate = this.currentDate.plus({ days: -7 })
      } else if (type == 'today') {
        this.currentDate = DateTime.now();
      }
    } else {
      if (type == 'add') {
        this.currentDate = this.currentDate.plus({ days: 30 })
      } else if (type == 'sub') {
        this.currentDate = this.currentDate.plus({ days: -30 })
      } else if (type == 'today') {
        this.currentDate = DateTime.now();
      }
    }

    this.generateNavDates(true);
  }

  changePeriod(period: string) {
    this.periodView = period;
    
    this.generateNavDates(true);
  }

  getFirstDay(change: boolean) {
    this.startDate = (!!this.startDate && this.startDate?.isValid && !change) ? this.startDate : this.currentDate.startOf(this.periodView);
  }

  getLastDay(change: boolean) {
    this.endDate = (!!this.endDate && this.endDate?.isValid && !change) ? this.endDate : this.currentDate.endOf(this.periodView);
  }

  // isSameDay(day1: DateTime, day2: DateTime) {
  //   if (!day1 && !day2) {
  //     return true;
  //   } else if ((!!day1 && !day2) || (!!day2 && !day1)) {
  //     return true;
  //   }
  //   return day1.startOf('day').toMillis() === day2.startOf('day').toMillis();
  // }

  // getTime(times, date) {
  //   const index = (!!times) ? times.findIndex(tte => this.isSameDay(DateTime.fromISO(tte.date), date)) : -1;
  //   if (index >= 0) {
  //     return times[index].hours + ':' + times[index].minutes;
  //   } else {
  //     return '00:00';
  //   }
  // }

  // getTimeId(times, date) {
  //   const index = (!!times) ? times.findIndex(tte => this.isSameDay(DateTime.fromISO(tte.date), date)) : -1;
  //   if (index >= 0) {
  //     return times[index]._id;
  //   }
  //   return '';
  // }

  // displayHideInput(id: string) {
  //   if (document.getElementById('input_' + id).style.display == 'none') {
  //     document.getElementById('input_' + id).parentElement.style.border = '2px solid #005fd5';
  //     document.getElementById('input_' + id).style.display = 'block';
  //     document.getElementById('input_' + id).focus();
  //     document.getElementById('span_' + id).style.display = 'none';
  //   } else {
  //     document.getElementById('input_' + id).parentElement.style.border = '1px solid #0000001f';
  //     document.getElementById('input_' + id).style.display = 'none';
  //     document.getElementById('span_' + id).style.display = 'block';
  //   }
  // }

  // onTimeInputChange($event, tte: any, date: any, timeId: string) {
  //   if (!!this.entryTime) {
  //     const time = this.entryTime.split(':');
  //     const entryTimeHours = time[0];
  //     const entryTimeMinutes = time[1];

  //     const index = (tte.times) ? tte.times.findIndex(t => this.isSameDay(DateTime.fromISO(t.date), date)) : -1;

  //     let editedEntity = {
  //       _id: tte._id,
  //       _user: this.userData?._id,
  //       _task: tte._task._id || tte._task,
  //       _category: tte._category,
  //       timeId: tte.times[index]._id || '',
  //       date: date,
  //       hours: entryTimeHours,
  //       minutes: entryTimeMinutes,
  //       comment: tte.times[index].comment || '',
  //     }

  //     this.utilityService.asyncNotification($localize`:@@timesheets.pleaseWait:Please wait we are updating the time...`, new Promise((resolve, reject) => {
  //       this.groupService.editTimeTrackingEntry(editedEntity, 'time')
  //         .then(async (res: any) => {
  //           if (!res.error) {
  //             this.displayHideInput(timeId);

  //             this.entryTime = '00:00';

  //             await this.generateNavDates();

  //             resolve(this.utilityService.resolveAsyncPromise($localize`:@@timesheets.timeEdited:Time Edited!`));
  //           } else {
  //             reject(this.utilityService.rejectAsyncPromise($localize`:@@timesheets.unableToEdited:Unable to edit Time!`));
  //           }
  //         });
  //     }))
  //   } else {
  //     this.displayHideInput(timeId);
  //   }
  // }

  openTimeTrackingDetails(tte: any) {
    const data = {
      tte: tte
    };

    const dialogRef = this.dialog.open(NewTimeTrackingDialogComponent, {
      width: '50%',
      height: '50%',
      disableClose: true,
      hasBackdrop: true,
      data: data,
    });

    // const newTimeEventSubs = dialogRef.componentInstance.newTimeEvent.subscribe(async (data) => {
    //   await this.generateNavDates();
    // });

    dialogRef.afterClosed().subscribe(async result => {
      // newTimeEventSubs.unsubscribe();
    });
  }
  
  formateDate(date) {
    return this.utilityService.formateDate(date, DateTime.DATE_MED);
  }
}
