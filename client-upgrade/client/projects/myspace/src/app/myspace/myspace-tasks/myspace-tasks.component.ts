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
    this.utilityService.startForegroundLoader();
    this.todayTasks = await this.getUserTodayTasks();
    this.thisWeekTasks = await this.getUserThisWeekTasks();
    this.overdueTasks = await this.getUserOverdueTasks();
    return this.utilityService.stopForegroundLoader();
  }

  async getUserTodayTasks() {
    let userService = this.injector.get(UserService);
    userService.getUserTodayTasks()
      .then((res) => {
        return res['tasks']
      })
      .catch(() => {
        return [];
      })
  }

  async getUserThisWeekTasks() {
    let userService = this.injector.get(UserService);
    userService.getUserThisWeekTasks()
      .then((res) => {
        return res['tasks']
      })
      .catch(() => {
        return [];
      })
  }

  async getUserOverdueTasks() {
    let userService = this.injector.get(UserService);
    userService.getUserOverdueTasks()
      .then((res) => {
        return res['tasks']
      })
      .catch(() => {
        return [];
      })
  }

}
