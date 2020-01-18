import {Component, OnInit} from '@angular/core';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import {PostService} from '../../../shared/services/post.service';
import {UserService} from '../../../shared/services/user.service';

@Component({
  selector: 'app-overview-my-tasks',
  templateUrl: './overview-my-tasks.component.html',
  styleUrls: ['./overview-my-tasks.component.scss']
})
export class OverviewMyTasksComponent implements OnInit {

  todayTasks: any = [];
  thisWeekTasks: any = [];
  overdueTasks: any = [];
  overdueAndTodayTasks = [];

  constructor(private ngxService: NgxUiLoaderService, private _postservice: PostService, private userService: UserService) {

  }

  async ngOnInit() {
    this.ngxService.start(); // start foreground loading with 'default' id

    // Stop the foreground loading after 5s
    setTimeout(() => {
      this.ngxService.stop(); // stop foreground loading with 'default' id
    }, 500);

    this.todayTasks = await this.getTodayTasks();
    this.thisWeekTasks = await this.getThisWeekTasks();
    this.overdueTasks = await this.getOverdueTasks();
    this.markOverdueTasks();
    this.overdueAndTodayTasks = this.overdueTasks.concat(this.todayTasks);
  }

  getTodayTasks() {
    return new Promise((resolve, reject) => {
      this.userService.getUserTodayTasks()
        .subscribe((res) => {
          resolve(res['tasks']);
        }, (err) => {
          reject([]);
        });
    });
  }

  getThisWeekTasks() {
    return new Promise((resolve, reject) => {
      this.userService.getUserThisWeekTasks()
        .subscribe((res) => {
          resolve(res['tasks']);
        }, (err) => {
          reject([]);
        });
    });
  }

  getOverdueTasks() {
    return new Promise((resolve, reject) => {
      this.userService.getUserOverdueTasks()
        .subscribe((res) => {
          resolve(res['tasks']);
        }, (err) => {
          reject([]);
        });
    });

  }

  private markOverdueTasks() {
    this.overdueTasks = this.overdueTasks.map(task => {
      task.overdue = true;
      return task;
    });
  }
}
