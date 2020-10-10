import { Component, Injector, OnInit } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { PostService } from 'src/shared/services/post-service/post.service';
import { UserService } from 'src/shared/services/user-service/user.service';

@Component({
  selector: 'app-work-statistics-card',
  templateUrl: './work-statistics-card.component.html',
  styleUrls: ['./work-statistics-card.component.scss']
})
export class WorkStatisticsCardComponent implements OnInit {

  // Current Workspace Data
  workspaceData: any

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
    private userService: UserService,
    private postService: PostService,
    private injector: Injector
  ) { }

  async ngOnInit() {
    // Call the HTTP API to fetch the current workspace details
    this.workspaceData = await this.publicFunctions.getWorkspaceDetailsFromHTTP();

    this.tasks = await this.getTodayTasks();
    this.overdueTasks = await this.getOverdueTasks();
    this.markOverdueTasks();

    for (let task of this.tasks){
      if (task.task.status=='to do') this.to_do_task_count++;
      else if (task.task.status=='in progress') this.in_progress_task_count++;
      else if (task.task.status=='done') this.done_task_count++;
    }
    this.task_count = this.tasks.length;
    this.overdue_task_count = this.overdueTasks.length;

    /* Chart Setup */
    this.barChartLabels = ['To Do', 'In Progress', 'Done', 'Overdue'];
    this.barChartData = [this.to_do_task_count, this.in_progress_task_count, this.done_task_count, this.overdue_task_count];
    this.barChartType = 'bar';
    this.barChartOptions = {
      cutoutPercentage: 75,
      responsive: true,
      legend: {
        display: false
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
  }

  async getTodayTasks() {
    return new Promise((resolve, reject) => {
      this.postService.getWorkspacePosts(this.workspaceData._id, 'task', 7, false)
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
      this.postService.getWorkspacePosts(this.workspaceData._id, 'task', 7, true)
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
