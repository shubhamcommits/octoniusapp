import { Component, Injector, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { PostService } from 'src/shared/services/post-service/post.service';

@Component({
  selector: 'app-work-statistics-card',
  templateUrl: './work-statistics-card.component.html',
  styleUrls: ['./work-statistics-card.component.scss']
})
export class WorkStatisticsCardComponent implements OnChanges {

  @Input() period;
  @Input() northStar: boolean;
  @Input() group: string;
  @Input() filteringGroups;

  // Current Workspace Data
  workspaceData: any

  chartReady = false;

  task_count = 0;

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

  ngOnChanges(changes: SimpleChanges) {
    /*
    for (const propName in changes) {
      const change = changes[propName];
      const to = change.currentValue;
    }
    */
    this.initView();
  }

  async initView() {
    if (this.filteringGroups) {
      this.filteringGroups = this.filteringGroups.map(group => (group._id || group));
    }

    // Call the HTTP API to fetch the current workspace details
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    /* Chart Setup */
    // this.barChartLabels = [this.to_do_task_count, this.in_progress_task_count, this.done_task_count, this.overdue_task_count];
    this.barChartLabels = (this.northStar) ?
      [
        $localize`:@@workStatisticsCard.notStarted:NOT STARTED`,
        $localize`:@@workStatisticsCard.onTrack:ON TRACK`,
        $localize`:@@workStatisticsCard.inDanger:IN DANGER`,
        $localize`:@@workStatisticsCard.achieved:ACHIEVED`,
        $localize`:@@workStatisticsCard.overdue:Overdue`
      ] : [
        $localize`:@@workStatisticsCard.toDo:To Do`,
        $localize`:@@workStatisticsCard.inProgress:In Progress`,
        $localize`:@@workStatisticsCard.done:Done`,
        $localize`:@@workStatisticsCard.overdue:Overdue`
      ];
    this.barChartData = (this.northStar) ? await this.getNorthStarTasksData() : await this.getTasksData();
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
              display: false,
              gridLines: {
                  drawBorder: false,
                  display: false,
              }
          }]
      },
    };
    this.barChartColors = (this.northStar) ? [{
        backgroundColor: [
          '#FFAB00',
          '#26A69A',
          '#EB5757',
          '#4A90E2',
          '#FF6584'
        ]
      }] : [{
        backgroundColor: [
          '#FFAB00',
          '#0bc6a0',
          '#4a90e2',
          '#FF6584'
        ]
      }];
    this.barChartPlugins = [{
      beforeDraw(chart, options) {

      }
    }];

    this.chartReady = true;
  }

  private markOverdueTasks(overdueTasks) {
    return  overdueTasks.map(task => {
      task.overdue = true;
      return task;
    });
  }

  private async getTasksData() {

    let to_do_task_count = 0;
    let in_progress_task_count = 0;
    let done_task_count = 0;
    let overdue_task_count = 0;

    const tasks = await this.getTasks();
    let overdueTasks = await this.getOverdueTasks();
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

  private async getNorthStarTasksData() {
    let not_started_count = 0;
    let on_track_count = 0;
    let in_danger_count = 0;
    let achieved_count = 0;
    let overdue_task_count = 0;

    const tasks = await this.getTasks();
    let overdueTasks = await this.getOverdueTasks();
    overdueTasks = this.markOverdueTasks(overdueTasks);

    for (let task of tasks) {
      let northStarValues = task.task.northStar.values;
      northStarValues.sort((t1, t2) => (t1.date > t2.date) ? -1 : 1);

      if (northStarValues[0].status=='NOT STARTED') not_started_count++;
      else if (northStarValues[0].status=='ON TRACK') on_track_count++;
      else if (northStarValues[0].status=='IN DANGER') in_danger_count++;
      else if (northStarValues[0].status=='ACHIEVED') achieved_count++;
    }

    overdue_task_count = overdueTasks.length;
    this.task_count = not_started_count + on_track_count + in_danger_count + achieved_count + overdue_task_count;

    return [not_started_count, on_track_count, in_danger_count, achieved_count, overdue_task_count];
  }

  async getTasks() {
    let tasks = [];
    if (this.group) {
      await this.postService.getGroupPosts(this.group, 'task', this.period, false)
      .then((res) => {
        tasks = res['posts'];
      });
    } else {
      await this.postService.getWorkspacePosts(this.workspaceData._id, 'task', this.period, false, this.northStar, this.filteringGroups)
        .then((res) => {
          tasks = res['posts'];
        });
    }
    return tasks;
  }

  async getOverdueTasks() {
    let overdueTasks = [];

    if (this.group) {
      await this.postService.getGroupPosts(this.group, 'task', this.period, true)
      .then((res) => {
        overdueTasks = res['posts'];
      });
    } else {
      await this.postService.getWorkspacePosts(this.workspaceData._id, 'task', this.period, true, this.northStar, this.filteringGroups)
      .then((res) => {
        overdueTasks = res['posts'];
      });
    }

    return overdueTasks;
  }
}
