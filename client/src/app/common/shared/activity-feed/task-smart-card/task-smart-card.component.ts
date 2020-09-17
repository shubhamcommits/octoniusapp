import {  Component, OnInit } from '@angular/core';
import { UserService } from 'src/shared/services/user-service/user.service';
import { ChartType } from 'chart.js';
import { Label, MultiDataSet } from 'ng2-charts';

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

  doughnutChartLabels;
  doughnutChartData;
  doughnutChartType;
  doughnutChartOptions;
  doughnutChartColors;
  doughnutChartPlugins; //: PluginServiceGlobalRegistrationAndOptions[];

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

    /* Chart Setup */
    const percentageDone = ((this.done_task_count*100)/this.todayTasks.length);
    this.doughnutChartLabels = ['To Do', 'In Progress', 'Done'];
    this.doughnutChartData = [this.to_do_task_count, this.in_progress_task_count, this.done_task_count];
    this.doughnutChartType = 'doughnut';
    this.doughnutChartOptions = {
      cutoutPercentage: 75,
      responsive: true,
      legend: {
        display: false
      }
    };
    this.doughnutChartColors = [{
      backgroundColor: [
        '#fd7714',
        '#0bc6a0',
        '#4a90e2'
      ]
    }];
    this.doughnutChartPlugins = [{
      beforeDraw(chart) {
        const ctx = chart.ctx;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
        const centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);

        ctx.font = '25px Nunito';
        ctx.fillStyle = '#262628';

        ctx.fillText(Math.round(percentageDone) + '%', centerX, centerY);
      }
    }];
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
