import { Component, OnInit, Injector } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { UserService } from 'src/shared/services/user-service/user.service';

@Component({
  selector: 'app-members-workload-card',
  templateUrl: './members-workload-card.component.html',
  styleUrls: ['./members-workload-card.component.scss']
})
export class MembersWorkloadCardComponent implements OnInit {

  public publicFunctions = new PublicFunctions(this.injector);

  userData;
  groupData;
  groupMembers = [];
  groupTasks;

  period = 'this_week';
  periods = [
    {
     key: 'this_week',
     value: 'This week'
    },
    {
     key: 'next_week',
     value: 'Next week'
    },
    {
     key: 'this_month',
     value: 'This month'
    },
    {
     key: 'next_month',
     value: 'Next month'
    }
  ];

  chartsReady = false;

  // IsLoading behavior subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  // Base URL
  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  constructor(
    private injector: Injector,
    private groupService: GroupService
  ) { }

  async ngOnInit() {
    // Starts the spinner
    this.isLoading$.next(true);

    this.userData = await this.publicFunctions.getCurrentUser();
    this.groupData = await this.publicFunctions.getCurrentGroup();

    await this.initTable();

    // Stops the spinner and return the value with ngOnInit
    this.isLoading$.next(false);
  }

  async initTable() {

    this.period = (this.userData.stats.group_dashboard_members_period) ? this.userData.stats.group_dashboard_members_period : 'this_week';

    await this.groupService.getAllGroupMembers(this.groupData?._id).then(res => {
      this.groupMembers = res['users'];
    });

    this.groupTasks = await this.publicFunctions.getAllGroupTasks(this.groupData?._id, this.period);

    await this.assignTasks();

    this.chartsReady = true;
  }

  assignTasks() {

    this.groupMembers.forEach(async (member, index) => {
      const tasks = this.groupTasks.filter((task) => {
        return task._assigned_to.some((a) => {
          return a._id === member._id;
        });
      });
      this.groupMembers[index].tasks = tasks;
      this.groupMembers[index].tasksCount = tasks.length;

      this.groupMembers[index].barChart = await this.getUserWorkStatisticsChartData(tasks);
      this.groupMembers[index].topStatus = await this.getUserHighestStatusCount(this.groupMembers[index].barChart?.data);
      // this.groupMembers[index].lineChart = await this.getUserVelocityChartData(tasks);
    });
  }

  async getUserHighestStatusCount(taskCounts) {
    let toDoCount = taskCounts[0];
    let inProgressCount = taskCounts[1];
    let doneCount = taskCounts[2];

    let count = 0;
    let statusName = 'to do';

    if (toDoCount > inProgressCount) {
      if (toDoCount > doneCount) {
        count = toDoCount;
        statusName = 'to do';
      } else {
        count = doneCount;
        statusName = 'done';
      }
    } else if (inProgressCount > doneCount) {
      count = inProgressCount;
      statusName = 'in progress';
    } else {
      count = doneCount;
      statusName = 'done';
    }

    return {
      count: count,
      name: statusName
    };
  }

  private async getTasksStatisticsData(userTasks) {

    let toDoCount = 0;
    let inProgressCount = 0;
    let doneCount = 0;
    let overdueCount = 0;

    const today = moment().subtract(1, 'days').endOf('day').format();

    userTasks.forEach(task => {
      if (task.task.status == 'to do') toDoCount++;
      if (task.task.status == 'in progress') inProgressCount++;
      if (task.task.status == 'done') doneCount++;
      if (moment(task.task.due_to).isBefore(today)) overdueCount++;
    });

    return (this.period.toLowerCase() == 'this_week') ? [toDoCount, inProgressCount, doneCount, overdueCount] : [toDoCount, inProgressCount, doneCount];
  }

  async getUserWorkStatisticsChartData(tasks) {
    const data = await this.getTasksStatisticsData(tasks);
    const options = {
      legend: {
        display: false
      },
      scales: {
          yAxes: [{
              stacked: true,
              display: false,
              gridLines: {
                  drawBorder: false,
                  display: false,
              },
          }],
          xAxes: [{
              stacked: true,
              display: false,
              gridLines: {
                  drawBorder: false,
                  display: false,
              }
          }]
      },
    };

    const colors =
      (this.period.toLowerCase() == 'this_week')
        ? [{
          backgroundColor: [
            '#FFAB00',
            '#0bc6a0',
            '#4a90e2',
            '#FF6584'
          ]
        }]
        : [{
          backgroundColor: [
            '#FFAB00',
            '#0bc6a0',
            '#4a90e2'
          ]
        }];
    let plugins = [{
      beforeDraw(chart, options) {

      }
    }];

    return {
      data: data,
      options: options,
      colors: colors,
      type: 'bar',
      labels: (this.period.toLowerCase() == 'this_week') ? ['To Do', 'In Progress', 'Done', 'Overdue'] : ['To Do', 'In Progress', 'Done'],
      plugins: plugins
    }
  }

  async periodSelected(event) {
    // Starts the spinner
    this.isLoading$.next(true);

    this.period = event.value;
    this.userData.stats.group_dashboard_members_period = this.period;

    this.chartsReady = false;

    await this.initTable();

    // User service
    const userService = this.injector.get(UserService);

    // Update user´s period
    userService.updateUser(this.userData);
    this.publicFunctions.sendUpdatesToUserData(this.userData);

    // Stops the spinner and return the value with ngOnInit
    this.isLoading$.next(false);
  }
}
