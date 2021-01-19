import { Component, OnInit, Input, Injector } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { PostService } from 'src/shared/services/post-service/post.service';

@Component({
  selector: 'app-members-workload-card',
  templateUrl: './members-workload-card.component.html',
  styleUrls: ['./members-workload-card.component.scss']
})
export class MembersWorkloadCardComponent implements OnInit {

  public publicFunctions = new PublicFunctions(this.injector);

  groupData;
  groupMembers = [];
  groupTasks;

  period = 7;

  chartsReady = false;

  // IsLoading behavior subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  // Base URL
  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  constructor(
    private injector: Injector,
    private groupService: GroupService,
    private postService: PostService
  ) { }

  async ngOnInit() {

    // Starts the spinner
    this.isLoading$.next(true);

    this.groupData = await this.publicFunctions.getCurrentGroup();

    await this.groupService.getAllGroupMembers(this.groupData?._id).then(res => {
      this.groupMembers = res['users'];
    });

    // last week, this week, next week
    this.groupTasks = await this.publicFunctions.getAllGroupTasks(this.groupData?._id);

    await this.assignTasks();

    this.chartsReady = true;

console.log(this.groupMembers);
console.log(this.chartsReady);

    // Stops the spinner and return the value with ngOnInit
    this.isLoading$.next(false);
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

    return [toDoCount, inProgressCount, doneCount, overdueCount];
  }

  async getUserWorkStatisticsChartData(tasks) {
    const barChartData = await this.getTasksStatisticsData(tasks);
    const barChartOptions = {
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

    const barChartColors = [{
      backgroundColor: [
        '#FFAB00',
        '#0bc6a0',
        '#4a90e2',
        '#FF6584'
      ]
    }];
    let barChartPlugins = [{
      beforeDraw(chart, options) {

      }
    }];

    return {
      data: barChartData,
      options: barChartOptions,
      colors: barChartColors,
      type: 'bar',
      labels: ['To Do', 'In Progress', 'Done', 'Overdue'],
      plugins: barChartPlugins
    }
  }

  /*
  async getUserVelocityChartData(tasks) {
    const dates = this.getUserVelocityDates();
    const data = await this.getUserVelocityData(dates, tasks);
    const labels = this.formatUserVelocityDates(dates);
    const options = {
      responsive: true,
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
      }
    };

    const colors = [{
      borderColor: '#005FD5',
      backgroundColor: '#FFFFFF',
    }];
    let barChartPlugins = [{
      beforeDraw(chart, options) {

      }
    }];

    return {
      data: data,
      labels: labels,
      options: options,
      colors: colors,
      type: 'line',
      legend: true,
      plugins: []
    }
  }

  getUserVelocityDates() {
    let datesRet = [];
    if (this.period === 7) {
      for (let i = 6; i >= 0; i--) {
        datesRet.push(moment().subtract(i, 'days').startOf('day'));
      }
    } else if (this.period === 30) {
      for (let i = 11; i > 0; i--) {
        datesRet.push(moment().subtract(i*(30/12), 'days').startOf('day'));
      }
      datesRet.push(moment().subtract(0, 'days').startOf('day'));
    } else if (this.period === 365) {
      for (let i = 11; i >= 0; i--) {
        datesRet.push(moment().subtract(i, 'months').startOf('day'));
      }
    }

    return datesRet;
  }

  formatUserVelocityDates(dates) {
    let newDates = [];
    dates.forEach(date => {
      if (this.period === 365) {
        newDates.push(date.format('MMM/YYYY'));
      } else {
        newDates.push(date.format('YYYY-MM-DD'));
      }
    });
    return newDates;
  }

  getUserVelocityData(dates, userTasks) {
    let userVelocities = [];
    for (let i = 0; i < (dates.length - 1); i++) {
      userVelocities.push(this.getVelocityCounterPerDates(dates[i], dates[i+1], userTasks));
    }
    userVelocities.push(this.getVelocityCounterPerDates(dates[dates.length-1], null, userTasks));
  }

  private getVelocityCounterPerDates(fromDate: any, toDate: any, userTasks: any[]) {
    let returnCounter = 0;

    fromDate = fromDate.format('YYYY-MM-DD');
    if (toDate) {
      toDate = toDate.format('YYYY-MM-DD');
    }

    userTasks.forEach(task => {
      if (task.task && task.task.status && task.task.status == 'done') {
        let doneTasksCount = task.records.done_tasks_count;
        if (toDate) {
          doneTasksCount = doneTasksCount.filter(counter => counter.date >= fromDate && counter.date < toDate);
        } else {
          doneTasksCount = doneTasksCount.filter(counter => counter.date >= fromDate);
        }

        doneTasksCount.forEach(counter => {
          returnCounter += counter.count;
        });
      }
    });
    return returnCounter;
  }
  */
}
