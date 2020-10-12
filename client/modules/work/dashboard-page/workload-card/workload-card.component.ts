import { Component, Injector, Input, OnChanges, OnInit } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { PostService } from 'src/shared/services/post-service/post.service';

@Component({
  selector: 'app-workload-card',
  templateUrl: './workload-card.component.html',
  styleUrls: ['./workload-card.component.scss']
})
export class WorkloadCardComponent implements OnInit, OnChanges {

  @Input() period;

  // Current Workspace Data
  workspaceData: any;

  chartReady = false;

  task_count = 0;
  to_do_task_count = 0;
  in_progress_task_count = 0;
  done_task_count = 0

  tasks: any = [];
  overdueTasks: any = [];

  doughnutChartLabels;
  doughnutChartData;
  doughnutChartType;
  doughnutChartOptions;
  doughnutChartColors;
  doughnutChartPlugins;

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector)

  constructor(
    private postService: PostService,
    private injector: Injector
    ) { }

  ngOnInit() {
    this.initView();
  }

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
    this.task_count = this.tasks.length;

    /* Chart Setup */
    const percentageDone = (this.tasks.length + this.overdueTasks.length > 0) ? (((this.done_task_count)*100)/(this.tasks.length + this.overdueTasks.length)) : 0;
    this.doughnutChartLabels = ['To Do', 'In Progress', 'Done', 'Overdue'];
    this.doughnutChartData = [this.to_do_task_count, this.in_progress_task_count, this.done_task_count, this.overdueTasks.length];
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
        '#FFAB00',
        '#0bc6a0',
        '#4a90e2',
        '#FF6584'
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

    this.chartReady = true;
  }

  async getTasks() {
    return new Promise((resolve, reject) => {
      this.postService.getWorkspacePosts(this.workspaceData._id, 'task', this.period, false)
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
      this.postService.getWorkspacePosts(this.workspaceData._id, 'task', this.period, true)
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
