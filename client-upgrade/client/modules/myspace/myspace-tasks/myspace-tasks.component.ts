import { Component, OnInit, Injector } from '@angular/core';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-myspace-tasks',
  templateUrl: './myspace-tasks.component.html',
  styleUrls: ['./myspace-tasks.component.scss']
})
export class MyspaceTasksComponent implements OnInit {

  constructor(
    private injector: Injector,
    private utilityService: UtilityService
  ) { }

  todayTasks: any = [];
  thisWeekTasks: any = [];
  overdueTasks: any = [];
  overdueAndTodayTasks = [];

  async ngOnInit() {
    this.todayTasks = await this.getUserTodayTasks();
    this.thisWeekTasks = await this.getUserThisWeekTasks();
    this.overdueTasks = await this.getUserOverdueTasks();

    this.markOverdueTasks();
    this.overdueAndTodayTasks = this.overdueTasks.concat(this.todayTasks);
  }

  async getUserTodayTasks() {
    return new Promise((resolve, reject) => {
      let userService = this.injector.get(UserService);
      userService.getUserTodayTasks()
        .then((res) => {
          resolve(res['tasks'])
        })
        .catch(() => {
          reject([])
        })
    })
  }

  async getUserThisWeekTasks() {
    return new Promise((resolve, reject) => {
      let userService = this.injector.get(UserService);
      userService.getUserThisWeekTasks()
        .then((res) => {
          resolve(res['tasks'])
        })
        .catch(() => {
          reject([])
        })
    })
  }

  async getUserOverdueTasks() {
    return new Promise((resolve, reject) => {
      let userService = this.injector.get(UserService);
      userService.getUserOverdueTasks()
        .then((res) => {
          resolve(res['tasks'])
        })
        .catch(() => {
          reject([])
        })
    })
  }

  private markOverdueTasks() {
    this.overdueTasks = this.overdueTasks.map(task => {
      task.overdue = true;
      return task;
    });
  }

}
