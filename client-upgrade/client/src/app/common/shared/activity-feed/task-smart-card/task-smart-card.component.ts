import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/shared/services/user-service/user.service';

@Component({
  selector: 'app-task-smart-card',
  templateUrl: './task-smart-card.component.html',
  styleUrls: ['./task-smart-card.component.scss']
})
export class TaskSmartCardComponent implements OnInit {

  constructor(
    private userService: UserService
  ) { }

  today_task_count = 0;
  to_do_task_count = 0;
  in_progress_task_count = 0;
  done_task_count = 0

  todayTasks: any = [];
  overdueTasks: any = [];


  async ngOnInit() {
    this.todayTasks = await this.getUserTodayTasks();
    this.overdueTasks = await this.getUserOverdueTasks();
    this.markOverdueTasks();
    for (let task of this.todayTasks){
      if (task.task.status=='to do') this.to_do_task_count++;
      else if (task.task.status=='in progress') this.in_progress_task_count++;
      else if (task.task.status=='done') this.done_task_count++;
    }
    this.today_task_count = this.todayTasks.length;
  }

  async getUserTodayTasks() {
    return new Promise((resolve, reject) => {
      this.userService.getUserTodayTasks()
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
      this.userService.getUserOverdueTasks()
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
