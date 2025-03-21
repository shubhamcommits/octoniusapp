import { Component, Injector, Input, OnChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { BehaviorSubject } from 'rxjs';
import { PortfolioService } from 'src/shared/services/portfolio-service/portfolio.service';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PortfolioUserWorkloadDialogComponent } from '../../portfolio-user-workload-dialog/portfolio-user-workload-dialog.component';
import { DateTime, Interval } from 'luxon';
import { HRService } from 'src/shared/services/hr-service/hr.service';
import { GroupService } from 'src/shared/services/group-service/group.service';

@Component({
  selector: 'app-portfolio-members-workload-card',
  templateUrl: './portfolio-members-workload-card.component.html',
  styleUrls: ['./portfolio-members-workload-card.component.scss']
})
export class PortfolioMembersWorkloadCardComponent implements OnChanges {

  @Input() portfolioData;
  @Input() userData;

  portfolioGroupsMembers = [];
  groupTasks;

  //date for calendar Nav
  dates: any = [];
  currentDate: any = DateTime.now();
  currentMonth = '';

  // IsLoading behavior subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private portfolioService: PortfolioService,
    private userService: UserService,
    public utilityService: UtilityService,
    private hrService: HRService,
    private injector: Injector,
    public dialog: MatDialog,
  ) { }

  async ngOnChanges() {
    // Starts the spinner
    this.isLoading$.next(true);

    if (this.portfolioData && this.portfolioData?._id) {
      await this.initTable();
    }

    // Stops the spinner and return the value with ngOnInit
    this.isLoading$.next(false);
  }

  async initTable() {

    await this.portfolioService.getAllPortfolioGroupMembers(this.portfolioData?._id).then(res => {
      this.portfolioGroupsMembers = res['users'];
    });

    this.generateNavDates();
  }

  async generateNavDates() {
    const firstDay = this.currentDate.startOf("week");

    this.dates = await this.getRangeDates(firstDay);

    let tasks = [];
    await this.portfolioService.getPortfolioGroupTasksBetweenDays(this.portfolioData?._id, this.dates[0].toISODate(), this.dates[this.dates.length -1].toISODate()).then(res => {
      tasks = res['posts'];
    });

    let timeTrackingEntitiesMapped = [];
    await this.portfolioService.getPortfolioTimeTrackingEntites(this.portfolioData?._id, this.dates[0].toISODate(), this.dates[this.dates.length -1].toISODate()).then(async res => {
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
    });

    let holidays = [];
    const membersIds = this.portfolioGroupsMembers.map(member => {return member._id});
    await this.hrService.getMembersOff(membersIds, this.dates[0], this.dates[this.dates.length - 1], false).then(res => {
      holidays = res['holidays'];
    });

    this.portfolioGroupsMembers.forEach(async member => {
      member.workload = [];

      // filter member´s tasks
      const memberTasks = tasks.filter(post => { return post._assigned_to.includes(member?._id); });

      this.dates.forEach(async date => {
        let workloadDay = {
          date: date,
          is_current_day: this.isCurrentDay(date),
          is_weekend_day: this.isWeekend(date),
          numTasks: 0,
          numDoneTasks: 0,
          // allocation: 0,
          hours: '0',
          minutes: '0',
          outOfTheOfficeClass: '',
          overdue_tasks: 0,
          done_tasks: 0,
          todo_tasks: 0,
          inprogress_tasks: 0
        };

        const isToday = await this.isCurrentDay(date);

        if (isToday) {
          this.userService.getWorkloadOverdueTasksPortfolio(member?._id, this.portfolioData?._id)
            .then((res) => {
              workloadDay.overdue_tasks = res['tasks'].length;
            })
            .catch(() => {
              workloadDay.overdue_tasks = 0;
            });
        } else {
          workloadDay.overdue_tasks = 0;
        }

        const tasksTmp = await memberTasks.filter(post => {return this.isSameDay(date, DateTime.fromISO(post.task.due_to)) });
        workloadDay.numTasks = tasksTmp.length;

        let hours = 0;
        let minutes = 0;
        const tteMappedFiltered = timeTrackingEntitiesMapped.filter(tte => tte?._user?._id == member?._id && this.isSameDay(new DateTime(date), DateTime.fromISO(tte.date)));
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
          workloadDay.numDoneTasks = tasksTmp.filter(post => { return post.task.status == 'done'; }).length;
          workloadDay.todo_tasks = tasksTmp.filter(post => { return post?.task?.status == 'to do'}).length;
          workloadDay.inprogress_tasks = tasksTmp.filter(post => { return post?.task?.status == 'in progress'}).length;
        } else {
          workloadDay.numDoneTasks = 0;
          workloadDay.todo_tasks = 0;
          workloadDay.inprogress_tasks = 0;
        }

        const index = (!!holidays) ? holidays.findIndex(holiday => ((holiday._user._id == member._id) && (workloadDay.date >= DateTime.fromISO(holiday.start_date)) && (workloadDay.date <= DateTime.fromISO(holiday.end_date)))) : -1;
        if (index >= 0) {
          const outOfficeDay = holidays[index];
          workloadDay.outOfTheOfficeClass = (outOfficeDay.type == 'holidays')
            ? 'cal-day-holidays'
            : ((outOfficeDay.type == 'personal')
              ? 'cal-day-personal'
              : ((outOfficeDay.type == 'sick') ? 'cal-day-sick' : ''));

          workloadDay.outOfTheOfficeClass += (workloadDay.outOfTheOfficeClass != '' && outOfficeDay.approved) ? '-approved' : '';
        }
        member.workload.push(workloadDay);
      });

      member.workload = member.workload.sort((w1, w2) => (w1.date < w2.date) ? -1 : 1);
    });
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
      this.currentDate = this.currentDate.minus({ days: numDays })
    } else if (type == 'today') {
      this.currentDate = DateTime.now();
    }

    this.generateNavDates();
  }

  isCurrentDay(day) {
    return this.isSameDay(day, DateTime.now());
  }

  isSameDay(day1: DateTime, day2: DateTime) {
    return day1.startOf('day').toMillis() === day2.startOf('day').toMillis();
  }

  isWeekend(date) {
    var day = date.toFormat('d');
    return (day == '6') || (day == '0');
  }

  /**
   * This function is responsible for opening a fullscreen dialog to see the member profile
   */
  openUserWorkload(memberId: string): void {
    const data = {
      portfolioId: this.portfolioData?._id,
      userId: memberId
    }

    // const dialogRef = 
    this.dialog.open(PortfolioUserWorkloadDialogComponent, {
      data: data,
      width: '80%',
      disableClose: true,
      hasBackdrop: true
    });
  }
}
