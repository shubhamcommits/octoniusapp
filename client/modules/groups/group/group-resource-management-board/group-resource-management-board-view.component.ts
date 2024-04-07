import { Component, OnInit, Injector, Input } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { DateTime, Interval } from 'luxon';
import { BehaviorSubject } from 'rxjs';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { UserService } from 'src/shared/services/user-service/user.service';
import { HRService } from 'src/shared/services/hr-service/hr.service';
import moment from 'moment';
import { MatDialog } from '@angular/material/dialog';
import { UserTaskForDayDialogComponent } from 'src/app/common/shared/posts/user-task-for-day-dialog/user-task-for-day-dialog.component';
import { PostService } from 'src/shared/services/post-service/post.service';

@Component({
  selector: 'app-group-resource-management-board-view',
  templateUrl: './group-resource-management-board-view.component.html',
  styleUrls: ['./group-resource-management-board-view.component.scss']
})
export class GroupResourceManagementBoardViewComponent implements OnInit {

  @Input() sections: [];
  @Input() isAdmin: any = false;

  public publicFunctions = new PublicFunctions(this.injector);

  userData;
  groupData;
  groupMembers = [];
  groupTasks;

  //date for calendar Nav
  dates: any = [];
  currentDate: any = DateTime.now();
  currentMonth = '';

  // IsLoading behavior subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  constructor(
    private userService: UserService,
    private groupService: GroupService,
    public utilityService: UtilityService,
    private hrService: HRService,
    private injector: Injector,
    public dialog: MatDialog,
  ) { }

  async ngOnInit() {
    // Starts the spinner
    this.isLoading$.next(true);

    this.userData = await this.publicFunctions.getCurrentUser();
    this.groupData = await this.publicFunctions.getCurrentGroupDetails();

    await this.initTable();
  }

  async initTable() {
    await this.groupService.getAllGroupMembers(this.groupData?._id).then(res => {
      this.groupMembers = res['users'];
    });

    this.generateNavDates();
  }

  async generateNavDates() {
    const firstDay = this.currentDate.startOf("week");

    this.dates = await this.getRangeDates(firstDay);

    let tasks = [];
    await this.groupService.getGroupTasksBetweenDays(this.groupData._id, this.dates[0].toISODate(), this.dates[this.dates.length -1].toISODate()).then(async res => {
console.log({res});
      tasks = await this.publicFunctions.filterRAGTasks(res['posts'], this.userData);
    });
console.log({tasks});
    const membersIds = this.groupMembers.map(member => {return member._id});
    let holidays = [];
    await this.hrService.getMembersOff(membersIds, this.dates[0], this.dates[this.dates.length - 1], false).then(res => {
      holidays = res['holidays'];
    });

    let timeTrackingEntitiesMapped = [];
    await this.groupService.getGroupTimeTrackingEntites(this.groupData._id, this.dates[0].toISODate(), this.dates[this.dates.length -1].toISODate(), null).then(async res => {
      timeTrackingEntitiesMapped = [];
        const interval = Interval.fromDateTimes(this.dates[0], this.dates[this.dates.length -1]);
        res['timeTrackingEntities'].forEach(tte => {
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

            timeTrackingEntitiesMapped.push(tteMapped);
          });
        });
        timeTrackingEntitiesMapped = [...timeTrackingEntitiesMapped];
        timeTrackingEntitiesMapped = timeTrackingEntitiesMapped.filter(tte => (tte.hours !== '00' || tte.minutes !== '00') && interval.contains(DateTime.fromISO(tte.date)));
console.log({res});
    });

    this.groupMembers.forEach(async member => {
      member.workload = [];

      // filter member´s tasks
      const memberTasks = tasks.filter(post => {
        const index = (!!post._assigned_to) ? post._assigned_to.findIndex(a => (a._id || a) == (member._id || member)) : -1;
        return index >= 0;
      });
console.log({member});
console.log({memberTasks});
      this.dates.forEach(date => {
        let workloadDay = {
          date: date,
          is_current_day: date.is_current_day,
          is_weekend_day: this.isWeekend(date),
          total_tasks: [],
          // allocation: 0,
          hours: '0',
          minutes: '0',
          outOfTheOfficeClass: '',
          overdue_tasks: [],
          done_tasks: [],
          todo_tasks: [],
          inprogress_tasks: []
        };

        let tasksTmp = memberTasks.filter(post => this.isSameDay(new DateTime(date), DateTime.fromISO(post.task.due_to)));
console.log({tasksTmp});
        if (date.is_current_day) {
          this.userService.getWorkloadOverdueTasks(member?._id, this.groupData._id)
            .then(async (res) => {
              workloadDay.overdue_tasks = await this.publicFunctions.filterRAGTasks(res['tasks'], this.userData);
              workloadDay.total_tasks = tasksTmp.concat(workloadDay.overdue_tasks);
            })
            .catch(() => {
              workloadDay.overdue_tasks = [];
            });
        } else {
          workloadDay.total_tasks = tasksTmp;
        }

        let hours = 0;
        let minutes = 0;
        const tteMappedFiltered = timeTrackingEntitiesMapped.filter(tte => tte?._user?._id == member?._id && this.isSameDay(new DateTime(date), DateTime.fromISO(tte.date)));
console.log({timeTrackingEntitiesMapped});
console.log({tteMappedFiltered});
        tteMappedFiltered.forEach(tte => {
          hours += parseInt(tte.hours) || 0;
          minutes += parseInt(tte.minutes) || 0;

          if (!!minutes && minutes > 59) {
            minutes = minutes - 60;
            hours = hours + 1;
          }
        });

        workloadDay.hours = hours + '';
        workloadDay.minutes = minutes + '';

        if (tasksTmp && tasksTmp.length > 0) {
          // filter done/to do/in progress tasks count
          workloadDay.done_tasks = tasksTmp.filter(post => { return post.task.status == 'done'; });
          workloadDay.todo_tasks = tasksTmp.filter(post => { return post?.task?.status == 'to do'});
          workloadDay.inprogress_tasks = tasksTmp.filter(post => { return post?.task?.status == 'in progress'});
        } else {
          workloadDay.done_tasks = [];
          workloadDay.todo_tasks = [];
          workloadDay.inprogress_tasks = [];
        }
console.log({workloadDay});
        holidays.forEach(outOfficeDay => {
          if ((outOfficeDay._user._id == member._id) && (workloadDay.date >= DateTime.fromISO(outOfficeDay.start_date)) && (workloadDay.date <= DateTime.fromISO(outOfficeDay.end_date))) {
            workloadDay.outOfTheOfficeClass = (outOfficeDay.type == 'holidays')
              ? 'cal-day-holidays'
              : ((outOfficeDay.type == 'personal')
                ? 'cal-day-personal'
                : ((outOfficeDay.type == 'sick') ? 'cal-day-sick' : ''));

            workloadDay.outOfTheOfficeClass += (workloadDay.outOfTheOfficeClass != '' && outOfficeDay.approved) ? '-approved' : '';
          }
        });

        member.workload.push(workloadDay);
      });
      
      member.workload = member.workload.sort((w1, w2) => (w1.date < w2.date) ? -1 : 1);
    });

    // Stops the spinner and return the value with ngOnInit
    this.isLoading$.next(false);
  }

  getRangeDates(firstDay) {
    let dates = [];
    for (var i = 0; i < 7; i++) {
      let date = firstDay.plus({ days: i });
      date.is_current_day = this.isCurrentDay(date);
      date.is_weekend_day = this.isWeekend(date);
      dates.push(date);
    }

    if (this.dates[0]?.month == this.dates[this.dates?.length -1]?.month) {
      this.currentMonth = this.dates[0]?.toFormat('LLLL');
    } else {
      this.currentMonth = this.dates[0]?.toFormat('LLLL') + ' / ' + this.dates[this.dates?.length -1]?.toFormat('LLLL');
    }

    return dates;
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

  isCurrentDay(day) {
    return this.isSameDay(day, DateTime.now());
  }

  isSameDay(day1: any, day2: any) {
    if (!!day1 && !!day2) {
      if (day1 instanceof DateTime && day2 instanceof DateTime) {
        return day1.startOf('day').toMillis() == DateTime.now().startOf('day').toMillis();
      } else {
        return DateTime.fromISO(day1).startOf('day').toMillis() == DateTime.now().startOf('day').toMillis();
      }
    } else if ((!day1 && !!day2) || !!day1 && !day2) {
      return false;
    } else if (!day1 && !day2) {
      return true;
    }
  }

  isWeekend(date) {
    var day = date.toFormat('d');
    return (day == '6') || (day == '0');
  }

  /**
   * This function is responsible for opening a fullscreen dialog to see the member profile
   */
  openFullscreenModal(selectedDay: DateTime, selectedUser: any): void {
    const canOpen = !this.groupData?.enabled_rights;
    const dialogRef = this.utilityService.openPostDetailsFullscreenModal(null, this.groupData._id, canOpen, this.sections, moment(selectedDay.toJSDate()), selectedUser);

    if (dialogRef) {
      const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe(async (data) => {
        // Starts the spinner
        this.isLoading$.next(true);

        await this.initTable();
      });

      dialogRef.afterClosed().subscribe(result => {
        closeEventSubs.unsubscribe();
      });
    }
  }

  async openTaskForDayModal(selectedDay: DateTime, selectedUser: any, status: string, tasks: any[]) {
    const data = {
      status: status,
      selectedDay: selectedDay,
      selectedUser: selectedUser,
      tasksForTheDay: tasks
    }

    this.dialog.open(UserTaskForDayDialogComponent, {
      width: '75%',
      maxHeight: '80%',
      disableClose: false,
      hasBackdrop: true,
      data: data
    }).afterClosed().subscribe(async () => {
      // Starts the spinner
      this.isLoading$.next(true);
      await this.initTable();
    });
  }

  /**
   * This function is responsible for opening a fullscreen dialog to see the member profile
   */
  openMeberBusinessCard(userId: string): void {
    this.utilityService.openMeberBusinessCard(userId);
  }
}
