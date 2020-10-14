import { Component, Injector, Input, OnChanges, OnInit } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { PostService } from 'src/shared/services/post-service/post.service';
import { UserService } from 'src/shared/services/user-service/user.service';

@Component({
  selector: 'app-work-statistics-card',
  templateUrl: './work-statistics-card.component.html',
  styleUrls: ['./work-statistics-card.component.scss']
})
export class WorkStatisticsCardComponent implements OnChanges {

  @Input() period;
  @Input() northStar: boolean;

  // Current Workspace Data
  workspaceData: any

  chartReady = false;

  task_count = 0;
  to_do_task_count = 0;
  in_progress_task_count = 0;
  done_task_count = 0;
  overdue_task_count = 0;

  tasks: any = [];
  overdueTasks: any = [];

  barChartLabels;
  barChartData;
  barChartType;
  barChartOptions;
  barChartColors;
  barChartPlugins;

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector)

  constructor(
    private postService: PostService,
    private injector: Injector
  ) { }

  ngOnChanges() {
    this.initView();
  }

  async initView() {

    // Call the HTTP API to fetch the current workspace details
    this.workspaceData = await this.publicFunctions.getWorkspaceDetailsFromHTTP();

    this.tasks = await this.getTasks();
    this.overdueTasks = await this.getOverdueTasks();
    this.markOverdueTasks();

    for (let task of this.tasks){
      if (task.task.status=='to do') this.to_do_task_count++;
      else if (task.task.status=='in progress') this.in_progress_task_count++;
      else if (task.task.status=='done') this.done_task_count++;
    }
    this.overdue_task_count = this.overdueTasks.length;
    this.task_count = this.to_do_task_count + this.in_progress_task_count + this.done_task_count + this.overdue_task_count;

    /* Chart Setup */
    this.barChartLabels = [this.to_do_task_count, this.in_progress_task_count, this.done_task_count, this.overdue_task_count];
    this.barChartData = [this.to_do_task_count, this.in_progress_task_count, this.done_task_count, this.overdue_task_count];
    this.barChartType = 'bar';
    this.barChartOptions = {
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
              display: true,
              gridLines: {
                  drawBorder: false,
                  display: false,
              },
          }]
      }
    };
    this.barChartColors = [{
      backgroundColor: [
        '#FFAB00',
        '#0bc6a0',
        '#4a90e2',
        '#FF6584'
      ]
    }];
    this.barChartPlugins = [{
      beforeDraw(chart) {

      }
    }];

    this.chartReady = true;
  }

  async getTasks() {
    return new Promise((resolve, reject) => {
      this.postService.getWorkspacePosts(this.workspaceData._id, 'task', this.period, false, this.northStar)
        .then((res) => {
          resolve(res['posts'])
        })
        .catch(() => {
          reject([])
        });
    })
  }

  async getOverdueTasks() {
    return new Promise((resolve, reject) => {
      this.postService.getWorkspacePosts(this.workspaceData._id, 'task', this.period, true, this.northStar)
        .then((res) => {
          resolve(res['posts'])
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
