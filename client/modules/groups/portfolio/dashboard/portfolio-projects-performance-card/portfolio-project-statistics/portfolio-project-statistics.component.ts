import { Component, Injector, Input, OnChanges, OnInit } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment';
import { PostService } from 'src/shared/services/post-service/post.service';

@Component({
  selector: 'app-portfolio-project-statistics-card',
  templateUrl: './portfolio-project-statistics.component.html',
  styleUrls: ['./portfolio-project-statistics.component.scss']
})
export class PortfolioProjectStatisticsComponent implements OnChanges {

  @Input() project: any;

  chartReady = false;

  task_count = 0;

  to_do_task_count = 0;
  in_progress_task_count = 0;
  done_task_count = 0;
  overdue_task_count = 0;

  completitionPercentage = 0;
  completitionPercentageClass = '';
  projectStatusClass = '';

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

    this.completitionPercentageClass = "badge " + this.setStatusClass(this.project?.project_status, true);
    this.projectStatusClass = this.setStatusClass(this.project?.project_status, false);

    /* Chart Setup */
    const tasksData = await this.getTasksData();
    const percentageDone = await this.getPercentageDone(tasksData[2]);
    this.doughnutChartLabels = [$localize`:@@projectStatistics.toDo:To Do`, $localize`:@@projectStatistics.inProgress:In Progress`, $localize`:@@projectStatistics.done:Done`, $localize`:@@projectStatistics.overdue:Overdue`];
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

    const tasks = await this.getTasks(false);
    let overdueTasks = await this.getTasks(true);
    overdueTasks = this.markOverdueTasks(overdueTasks);

    for (let task of tasks) {
      if (task.task.status=='to do') this.to_do_task_count++;
      else if (task.task.status=='in progress') this.in_progress_task_count++;
      else if (task.task.status=='done') this.done_task_count++;
    }

    this.overdue_task_count = overdueTasks.length;
    this.task_count = this.to_do_task_count + this.in_progress_task_count + this.done_task_count + this.overdue_task_count;

    const percentageDone = (this.task_count + this.overdue_task_count > 0) ? ((this.done_task_count*100)/(this.task_count + this.overdue_task_count)) : 0;
    this.completitionPercentage = Math.round(percentageDone);

    //this.project.estimation_due_date = moment(Math.max(...tasks.map(post => moment(post.task.due_to))));
    const allTasks = tasks.concat(overdueTasks);
    this.project.estimation_due_date = (allTasks && allTasks.length > 0) ? this.publicFunctions.getHighestDate(allTasks) : this.project?.due_date;

    return [this.to_do_task_count, this.in_progress_task_count, this.done_task_count, this.overdue_task_count];
  }

  async getTasks(overdue: boolean) {
    let tasks = [];
    await this.postService.getColumnPosts(this.project?._id, overdue)
      .then((res) => {
        tasks = res['posts'];
      });
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

  setStatusClass(status, isBadge) {
    if (isBadge) {
      if (status === 'NOT STARTED') {
        return 'badge_not_started';
      } else if (status === 'ON TRACK') {
        return 'badge_on_track';
      } else if (status === 'IN DANGER') {
        return 'badge_in_danger';
      } else if (status === 'ACHIEVED') {
        return 'badge_achieved';
      } else {
        return 'badge_on_track';
      }
    } else {
      if (status === 'NOT STARTED') {
        return 'not_started';
      } else if (status === 'ON TRACK') {
        return 'on_track';
      } else if (status === 'IN DANGER') {
        return 'in_danger';
      } else if (status === 'ACHIEVED') {
        return 'achieved';
      } else {
        return 'on_track';
      }
    }
  }

  formateDate(date: any, format: string) {
    return date ? moment.utc(date).format(format) : '';
  }
}
