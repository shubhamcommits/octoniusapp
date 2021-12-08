import { Component, Injector, Input, OnChanges, OnInit } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { PostService } from 'src/shared/services/post-service/post.service';

@Component({
  selector: 'app-workload-card',
  templateUrl: './workload-card.component.html',
  styleUrls: ['./workload-card.component.scss']
})
export class WorkloadCardComponent implements OnChanges {

  @Input() period;
  @Input() group: string;
  @Input() filteringGroups;

  // Current Workspace Data
  workspaceData: any;

  chartReady = false;

  task_count = 0;

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

  ngOnChanges() {
    this.initView();
  }

  async initView() {

    if (this.filteringGroups) {
      this.filteringGroups = this.filteringGroups.map(group => (group._id || group));
    }

    // Call the HTTP API to fetch the current workspace details
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    /* Chart Setup */
    const tasksData = await this.getTasksData();
    const percentageDone = await this.getPercentageDone(tasksData[2]);
    this.doughnutChartLabels = [
      $localize`:@@workloadCard.toDo:To Do`,
      $localize`:@@workloadCard.inProgress:In Progress`,
      $localize`:@@workloadCard.done:Done`,
      $localize`:@@workloadCard.overdue:Overdue`
    ];
    this.doughnutChartData = tasksData;
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

  private async getTasksData() {

    let to_do_task_count = 0;
    let in_progress_task_count = 0;
    let done_task_count = 0;
    let overdue_task_count = 0;

    const tasks = await this.getTasks(false);
    let overdueTasks = await this.getTasks(true);
    overdueTasks = this.markOverdueTasks(overdueTasks);

    for (let task of tasks) {
      if (task.task.status=='to do') to_do_task_count++;
      else if (task.task.status=='in progress') in_progress_task_count++;
      else if (task.task.status=='done') done_task_count++;
    }

    overdue_task_count = overdueTasks.length;
    this.task_count = to_do_task_count + in_progress_task_count + done_task_count + overdue_task_count;

    return [to_do_task_count, in_progress_task_count, done_task_count, overdue_task_count];
  }

  async getTasks(overdue: boolean) {
    let tasks = [];
    if (this.group) {
      await this.postService.getGroupPosts(this.group, 'task', this.period, overdue)
      .then((res) => {
        tasks = res['posts'];
      });
    } else {
      await this.postService.getWorkspacePosts(this.workspaceData._id, 'task', this.period, overdue, false, this.filteringGroups)
        .then((res) => {
          tasks = res['posts'];
        });
    }
    return tasks;
  }

  private markOverdueTasks(overdueTasks) {
    return  overdueTasks.map(task => {
      task.overdue = true;
      return task;
    });
  }

  private getPercentageDone(doneTasksCount) {
   return  (this.task_count > 0) ? (((doneTasksCount)*100)/(this.task_count)) : 0
  }
}
