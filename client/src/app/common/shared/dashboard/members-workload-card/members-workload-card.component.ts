import { Component, OnInit, Injector, Input } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

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
  // membersIds = [];
  groupTasks;

  //date for calendar Nav
  dates: any = [];

  currentDate: any = moment().format();;

  currentMonth = '';

  // IsLoading behavior subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  // Base URL
  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  constructor(
    private injector: Injector,
    private groupService: GroupService,
    public utilityService: UtilityService
  ) { }

  async ngOnInit() {
    // Starts the spinner
    this.isLoading$.next(true);

    this.userData = await this.publicFunctions.getCurrentUser();
    this.groupData = await this.publicFunctions.getCurrentGroupDetails(this.groupId);

    await this.initTable();

    // Stops the spinner and return the value with ngOnInit
    this.isLoading$.next(false);
  }

  async initTable() {
    this.groupService.getAllGroupMembers(this.groupData?._id).then(res => {
      this.groupMembers = res['users'];
      // this.membersIds = this.groupMembers.map(member => member._id);
    });

    this.generateNavDates();
  }

  async generateNavDates() {
    const firstDay = moment(this.currentDate).startOf('week').add(1, 'd');

    this.dates = await this.getRangeDates(firstDay);

    let tasks = [];
    await this.groupService.getGroupTasksBetweenDays(this.groupData._id, moment(this.dates[0]).format('YYYY-MM-DD'), moment(this.dates[this.dates.length -1]).format('YYYY-MM-DD')).then(res => {
      tasks = res['posts'];
    });

    this.groupMembers.forEach(async member => {

      member.workload = [];
      const memberTasks = tasks.filter(post => { return post._assigned_to.includes(member?._id); });

      this.dates.forEach(async date => {
        let workloadDay = {
          date: date,
          numTasks: 0,
          numDoneTasks: 0,
          allocation: 0,
          outOfTheOfficeClass: ''
        };

        const tasksTmp = await memberTasks.filter(post => { return moment(date).startOf('day').isSame(moment(post.task.due_to).startOf('day')) });
        workloadDay.numTasks = tasksTmp.length;

        if (tasksTmp && tasksTmp.length > 0) {
          const allocationTasks = tasksTmp.map(post => post?.task?.allocation || 0);

          workloadDay.allocation = allocationTasks
            .reduce((a, b) => {
              return a + b;
            });
        } else {
          workloadDay.allocation = 0;
        }

        const doneTasks = await tasksTmp.filter(post => { return post.task.status == 'done'; });
        workloadDay.numDoneTasks = doneTasks.length;

        const index = member?.out_of_office?.findIndex(outOfficeDay => moment(outOfficeDay.date).isSame(moment(date, 'day')));

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
      member.workload.sort((w1, w2) => (moment(w1.date).startOf('day').isBefore(moment(w2.date).startOf('day'))) ? -1 : 1);
    });
  }

  getRangeDates(firstDay) {
    let dates = [];
    for (var i = 0; i < 7; i++) {
      dates.push(moment(firstDay).add(i, 'days'));
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
      this.currentDate = moment(this.currentDate).add(numDays, 'days');
    } else if (type == 'sub') {
      this.currentDate = moment(this.currentDate).subtract(numDays, 'days');
    }
    this.generateNavDates()
  }

  isCurrentDay(day) {
    return day.startOf('day').isSame(moment().startOf('day'));
  }

  isWeekend(date) {
    var day = date.format('d');
    return (day == '6') || (day == '0');
  }

  /**
   * This function is responsible for opening a fullscreen dialog to see the member profile
   */
  openFullscreenModal(userId: string): void {
    this.utilityService.openFullscreenModal(userId);
  }
}
