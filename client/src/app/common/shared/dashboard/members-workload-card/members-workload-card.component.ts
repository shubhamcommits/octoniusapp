import { Component, OnInit, Injector, Input } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-members-workload-card',
  templateUrl: './members-workload-card.component.html',
  styleUrls: ['./members-workload-card.component.scss']
})
export class MembersWorkloadCardComponent implements OnInit {

  @Input() groupId: string;

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

  // Base URL
  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  constructor(
    private userService: UserService,
    private injector: Injector,
    private groupService: GroupService,
    public utilityService: UtilityService
  ) { }

  async ngOnInit() {
    // Starts the spinner
    this.isLoading$.next(true);

    this.userData = await this.publicFunctions.getCurrentUser();
    this.groupData = await this.publicFunctions.getGroupDetails(this.groupId);

    await this.initTable();

    // Stops the spinner and return the value with ngOnInit
    this.isLoading$.next(false);
  }

  async initTable() {
    this.groupService.getAllGroupMembers(this.groupData?._id).then(res => {
      this.groupMembers = res['users'];
    });

    this.generateNavDates();
  }

  async generateNavDates() {
    const firstDay = this.currentDate.startOf("week");

    this.dates = await this.getRangeDates(firstDay);

    let tasks = [];
    await this.groupService.getGroupTasksBetweenDays(this.groupData._id, this.dates[0].toISODate(), this.dates[this.dates.length -1].toISODate()).then(res => {
      tasks = res['posts'];
    });

    this.groupMembers.forEach(async member => {

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
          allocation: 0,
          outOfTheOfficeClass: '',
          overdue_tasks: 0,
          done_tasks: 0,
          todo_tasks: 0,
          inprogress_tasks: 0
        };

        if (this.isCurrentDay(date)) {
          this.userService.getWorkloadOverdueTasks(member?._id, this.groupId)
            .then((res) => {
              workloadDay.overdue_tasks = res['tasks'].length;
            })
            .catch(() => {
              workloadDay.overdue_tasks = 0;
            });
        }

        const tasksTmp = await memberTasks.filter(post => {return this.isSameDay(new DateTime(date), DateTime.fromISO(post.task.due_to)) });
        workloadDay.numTasks = tasksTmp.length;

        if (tasksTmp && tasksTmp.length > 0) {
          if (this.groupData.enable_allocation && this.groupData.resource_management_allocation) {
            const allocationTasks = tasksTmp.map(post => post?.task?.allocation || 0);

            workloadDay.allocation = allocationTasks
              .reduce((a, b) => {
                return a + b;
              });
          }

          // filter done/to do/in progress tasks count
          workloadDay.numDoneTasks = tasksTmp.filter(post => { return post.task.status == 'done'; }).length;
          workloadDay.todo_tasks = tasksTmp.filter(post => { return post?.task?.status == 'to do'}).length;
          workloadDay.inprogress_tasks = tasksTmp.filter(post => { return post?.task?.status == 'in progress'}).length;
        } else {
          workloadDay.allocation = 0;
          workloadDay.numDoneTasks = 0;
          workloadDay.todo_tasks = 0;
          workloadDay.inprogress_tasks = 0;
        }

        const index = member?.out_of_office?.findIndex(outOfficeDay => this.isSameDay(DateTime.fromISO(outOfficeDay.date), date));

        if (index >= 0) {
          const outOfficeDay = member?.out_of_office[index];
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
      this.currentDate = this.currentDate.plus({ days: -numDays })
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
  openFullscreenModal(userId: string): void {
    this.utilityService.openMeberBusinessCard(userId);
  }
}
