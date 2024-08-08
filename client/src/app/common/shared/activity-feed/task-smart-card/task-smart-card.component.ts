import {  Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { UserService } from 'src/shared/services/user-service/user.service';
import { SubSink } from 'subsink';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';
import { ChartData, ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'app-task-smart-card',
  templateUrl: './task-smart-card.component.html',
  styleUrls: ['./task-smart-card.component.scss']
})
export class TaskSmartCardComponent implements OnInit, OnDestroy {

  // Subsink Object
  subSink = new SubSink();

  today_task_count = 0;
  to_do_task_count = 0;
  in_progress_task_count = 0;
  done_task_count = 0

  todayTasks: any = [];
  overdueTasks: any = [];

  // doughnutChartLabels;
  // doughnutChartData;
  // doughnutChartType;
  
  public doughnutChartType: ChartType = 'doughnut';
  public doughnutChartLabels: string[] = ['To Do', 'In Progress', 'Done', 'Overdue'];
  public doughnutChartData: ChartData<'doughnut'>;
  doughnutChartOptions: ChartOptions<'doughnut'>;
  doughnutChartPlugins;

  userData;

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector)

  constructor(
    private userService: UserService,
    private utilityService: UtilityService,
    private injector: Injector
  ) { }

  async ngOnInit() {

    this.userData = await this.publicFunctions.getCurrentUser();
    
    this.todayTasks = await this.publicFunctions.filterRAGTasks(await this.getUserTodayTasks(), this.userData);
    this.overdueTasks = await this.publicFunctions.filterRAGTasks(await this.getUserOverdueTasks(), this.userData);

    this.markOverdueTasks();

    for (let task of this.todayTasks){
      if (task.task.status=='to do') this.to_do_task_count++;
      else if (task.task.status=='in progress') this.in_progress_task_count++;
      else if (task.task.status=='done') this.done_task_count++;
    }
    this.today_task_count = this.todayTasks.length;

    /* Chart Setup */
    const percentageDone = (this.todayTasks.length + this.overdueTasks.length > 0) ? (((this.done_task_count)*100)/(this.todayTasks.length + this.overdueTasks.length)) : 0;
    this.doughnutChartLabels = ['To Do', 'In Progress', 'Done', 'Overdue'];
    this.doughnutChartData = {
      labels: this.doughnutChartLabels,
      datasets: [
        {
          // data: [200, 100, 50, 150],
          data: [this.to_do_task_count, this.in_progress_task_count, this.done_task_count, this.overdueTasks.length],
          backgroundColor: [ '#FFAB00', '#0bc6a0', '#4a90e2', '#FF6584' ],
        }
      ]
    };
    this.doughnutChartOptions = {
      responsive: true,
      cutout: 60,
      plugins: {
        legend: {
          display: false
        }
      }
    };
    
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

  /**
   * Unsubscribe all the observables to avoid memory leaks
   */
  ngOnDestroy() {
    this.subSink.unsubscribe()
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

  async changeState(state:string){
    this.utilityService.handleActiveStateTopNavBar().emit(state);
  }
}
