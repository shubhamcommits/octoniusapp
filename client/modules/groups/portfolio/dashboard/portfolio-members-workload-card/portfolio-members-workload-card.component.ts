import { Component, OnInit, Injector, Input } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PortfolioService } from 'src/shared/services/portfolio-service/portfolio.service';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-portfolio-members-workload-card',
  templateUrl: './portfolio-members-workload-card.component.html',
  styleUrls: ['./portfolio-members-workload-card.component.scss']
})
export class PortfolioMembersWorkloadCardComponent implements OnInit {

  @Input() portfolioData;
  @Input() userData;

  portfolioGroupsMembers = [];
  groupTasks;

  //date for calendar Nav
  dates: any = [];

  currentDate: any = moment().format();

  currentMonth = '';

  // IsLoading behavior subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  // Base URL
  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private portfolioService: PortfolioService,
    private userService: UserService,
    private injector: Injector,
    public utilityService: UtilityService
  ) { }

  async ngOnInit() {
    // Starts the spinner
    this.isLoading$.next(true);

    await this.initTable();

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
    const firstDay = moment(this.currentDate).startOf('week').add(1, 'd');

    this.dates = await this.getRangeDates(firstDay);

    let tasks = [];
    await this.portfolioService.getPortfolioGroupTasksBetweenDays(this.portfolioData?._id, moment(this.dates[0]).format('YYYY-MM-DD'), moment(this.dates[this.dates.length -1]).format('YYYY-MM-DD')).then(res => {
      tasks = res['posts'];
    });

    this.portfolioGroupsMembers.forEach(async member => {
      member.workload = [];

      // filter member´s tasks
      const memberTasks = tasks.filter(post => { return post._assigned_to.includes(member?._id); });

      this.dates.forEach(async date => {
        let workloadDay = {
          date: date,
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
          this.userService.getWorkloadOverdueTasksPortfolio(member?._id, this.portfolioData?._id)
            .then((res) => {
              workloadDay.overdue_tasks = res['tasks'].length;
            })
            .catch(() => {
              workloadDay.overdue_tasks = 0;
            });
        }

        const tasksTmp = await memberTasks.filter(post => {return moment(date).isSame(moment(post.task.due_to), 'day') });
        workloadDay.numTasks = tasksTmp.length;

        if (tasksTmp && tasksTmp.length > 0) {
          const allocationTasks = tasksTmp.map(post => post?.task?.allocation || 0);

          workloadDay.allocation = allocationTasks
            .reduce((a, b) => {
              return a + b;
            });

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

        const index = member?.out_of_office?.findIndex(outOfficeDay => moment.utc(outOfficeDay.date).isSame(date, 'day'));

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
      member.workload = member.workload.sort((w1, w2) => moment.utc(w1.date).isBefore(w2.date) ? -1 : 1);
    });
  }

  getRangeDates(firstDay) {
    let dates = [];
    for (var i = 0; i < 7; i++) {
      dates.push(moment(firstDay).add(i, 'd'));
    }

    if (this.dates[0]?.month == this.dates[this.dates?.length -1]?.month) {
      this.currentMonth = moment(this.dates[0]).format('MMMM');
    } else {
      this.currentMonth = moment(this.dates[0]).format('MMMM') + ' / ' + moment(this.dates[this.dates?.length -1]).format('MMMM');
    }

    return dates;
  }

  changeDates(numDays: number, type: string) {
    if (type == 'add') {
      this.currentDate = moment(this.currentDate).add(numDays, 'd');
    } else if (type == 'sub') {
      this.currentDate = moment(this.currentDate).subtract(numDays, 'd');
    } else if (type == 'today') {
      this.currentDate = moment().format();
    }
    this.generateNavDates()
  }

  isCurrentDay(day) {
    return moment(day).isSame(this.currentDate, 'day');
  }

  isWeekend(date) {
    var day = date.format('d');
    return (day == '6') || (day == '0');
  }

  /**
   * This function is responsible for opening a fullscreen dialog to see the member profile
   */
  openFullscreenModal(userId: string): void {
    this.utilityService.openMeberBusinessCard(userId);
  }
}
