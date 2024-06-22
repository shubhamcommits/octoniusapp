import { Component, OnInit, Injector, Input, OnChanges, SimpleChanges, OnDestroy, LOCALE_ID, ViewChild } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { DateTime, Interval } from 'luxon';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { NewTimeTrackingDialogComponent } from 'src/app/common/shared/new-time-tracking-dialog/new-time-tracking-dialog.component';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { DecimalPipe } from '@angular/common';
import { DatesService } from 'src/shared/services/dates-service/dates.service';
// import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-group-time-tracking-view',
  templateUrl: './group-time-tracking-view.component.html',
  styleUrls: ['./group-time-tracking-view.component.scss']
})
export class GroupTimeTrackingViewComponent implements OnInit, OnChanges, OnDestroy {

  @Input() startDate: any;
  @Input() endDate: any;
  @Input() filterUserId: any;
  @Input() exportData: any;
  @Input() isAdmin: any = false;
  
  // @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  
  groupData: any;
  userData: any;

  // timeTrackingEntities = [];
  timeTrackingEntitiesMapped = [];
  dataSource = [];
  // dataSource = new MatTableDataSource<any>();

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
    private datesService: DatesService,
    private utilityService: UtilityService,
    private injector: Injector,
    public dialog: MatDialog,
    private decimalPipe: DecimalPipe
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

    if (!!changes.exportData && changes.exportData.currentValue != changes.exportData.previousValue) {
      this.exportTimes('excel');
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

    this.displayedColumns = (this.isAdmin)
      ? ['task', 'time', 'date', 'category', 'comment', 'cost', 'star']
      : ['task', 'time', 'date', 'category', 'comment'];

    await this.generateNavDates(false);

    // Return the function via stopping the loader
    return this.isLoading$.next(false);
  }

  async generateNavDates(change: boolean) {
    await this.getFirstDay(change);
    await this.getLastDay(change);

    let timeTrackingEntities = [];
    await this.groupService.getGroupTimeTrackingEntites(this.groupData._id, this.startDate, this.endDate, this.filterUserId).then(async res => {
      timeTrackingEntities = res['timeTrackingEntities'].filter(tte => !!tte.times && tte.times.length > 0);
    });

    await this.initTable(timeTrackingEntities);
  }
  
	async initTable(timeTrackingEntities: any) {
    this.timeTrackingEntitiesMapped = [];
    const interval = Interval.fromDateTimes(this.startDate, this.endDate);
    timeTrackingEntities.forEach(tte => {
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
          cost: time.cost,
        };

        this.timeTrackingEntitiesMapped.push(tteMapped);
      });
    });
    this.timeTrackingEntitiesMapped = [...this.timeTrackingEntitiesMapped];
    this.timeTrackingEntitiesMapped = this.timeTrackingEntitiesMapped.filter(tte => (tte.hours !== '00' || tte.minutes !== '00') && interval.contains(DateTime.fromISO(tte.date)));

    this.buildDataSource();
	}

  buildDataSource() {
    this.dataSource = this.groupBy(this.timeTrackingEntitiesMapped, this.reducedGroups);
    // this.dataSource.paginator = this.paginator;
  }

  groupBy(data: any[], reducedGroups?: any[]) {
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
            cost: userNumbers.cost,
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
        userTotals[userId] = { hours: 0, minutes: 0, tasks: new Set(), cost: 0 };
      }

      // Add the hours and minutes from the current entry
      userTotals[userId].hours += parseInt(tte.hours);
      userTotals[userId].minutes += parseInt(tte.minutes);

      // Add the task to the set for counting unique tasks
      userTotals[userId].tasks.add(tte._task._id);

      userTotals[userId].cost += tte.cost;
    });

    // Convert excess minutes to hours if necessary
    const { hours, minutes } = userTotals[userId];
    const extraHours = Math.floor(minutes / 60);

    userTotals[userId].hours += extraHours;
    userTotals[userId].minutes %= 60;

    // Return an object with the total hours, minutes, and tasks for the specified user
    return {
      totalHours: userTotals[userId].hours,
      totalMinutes: userTotals[userId].minutes,
      totalTasks: userTotals[userId].tasks.size,
      cost: userTotals[userId].cost,
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

    dialogRef.afterClosed().subscribe(async result => {
    });
  }

  async exportTimes(exportType: string) {
    if (!!this.groupData && !!this.dataSource) {
      const dataToExport = await this.dataSource.map(tte => {
        if (tte.isGroup) {
          if (this.isAdmin) {
            return {
              user: tte.userName,
              task: tte.totalTasks,
              date: '',
              hours: tte?.totalHours,
              minutes: tte?.totalMinutes,
              category: '',
              comment: '',
              cost: tte?.cost
            }
          } else {
            return {
              user: tte.userName,
              task: tte.totalTasks,
              date: '',
              hours: tte?.totalHours,
              minutes: tte?.totalMinutes,
              category: '',
              comment: ''
            }
          }
        } else {
          if (this.isAdmin) {
            return {
              user: '',
              task: tte?._task?.title,
              date: this.formateDate(tte?.date),
              hours: tte?.hours,
              minutes: tte?.minutes,
              category: tte?._category,
              comment: tte?.comment,
              cost: this.decimalPipe.transform(tte?.cost, '1.2-2')
            }
          } else {
            return {
              user: '',
              task: tte?._task?.title,
              date: this.formateDate(tte?.date),
              hours: tte?.hours,
              minutes: tte?.minutes,
              category: tte?._category,
              comment: tte?.comment
            }
          }
        }
      });
      this.groupService.exportTasksToFile(exportType, dataToExport, this.groupData?.group_name + '_times');
      this.utilityService.updateIsLoadingSpinnerSource(false);
    }
  }

  recalculateCost(timeTrackingEntityId: string, timeId: string) {
    this.utilityService.getConfirmDialogAlert($localize`:@@taskTimeTrackingList.areYouSure:Are you sure?`, $localize`:@@taskTimeTrackingList.recalculate:By doing this, you will re-calculate the cost of the selected time record with the current rate of the user!`)
			.then((res) => {
				if (res.value) {
					this.groupService.recalculateCost(timeTrackingEntityId, timeId).then(async res => {
						await this.generateNavDates(false);
					})
				}
			});
  }
  
  formateDate(date) {
    return this.datesService.formateDate(date, DateTime.DATE_MED);
  }
}
