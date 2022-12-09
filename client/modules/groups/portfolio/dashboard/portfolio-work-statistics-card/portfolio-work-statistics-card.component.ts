import { Component, Injector, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { PortfolioService } from 'src/shared/services/portfolio-service/portfolio.service';

@Component({
  selector: 'app-portfolio-work-statistics-card',
  templateUrl: './portfolio-work-statistics-card.component.html',
  styleUrls: ['./portfolio-work-statistics-card.component.scss']
})
export class PortfolioWorkStatisticsCardComponent implements OnChanges {

  @Input() period;
  @Input() portfolioId;
  @Input() type = 'bar';

  tasks = [];
  overdueTasks = [];

  chartReady = false;

  task_count = 0;

  chartLabels;
  chartData;
  chartType;
  chartOptions;
  chartColors;
  chartPlugins;

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector)

  constructor(
    private portfolioService: PortfolioService,
    private injector: Injector
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    /*
    for (const propName in changes) {
      const change = changes[propName];
      const to = change.currentValue;
    }
    */
    if (this.portfolioId) {
      this.initView();
    }
  }

  async initView() {
    // Call the HTTP API to fetch the current workspace details
    // this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    /* Chart Setup */
    // this.chartLabels = [this.to_do_task_count, this.in_progress_task_count, this.done_task_count, this.overdue_task_count];
    this.chartLabels = [
        $localize`:@@workStatisticsCard.toDo:To Do`,
        $localize`:@@workStatisticsCard.inProgress:In Progress`,
        $localize`:@@workStatisticsCard.done:Done`,
        $localize`:@@workStatisticsCard.overdue:Overdue`
      ];
    this.chartData = await this.getTasksData();
    this.chartType = this.type;
    this.chartOptions = {
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
    this.chartColors = [{
        backgroundColor: [
          '#FFAB00',
          '#0bc6a0',
          '#4a90e2',
          '#FF6584'
        ]
      }];
    this.chartPlugins = [{
      beforeDraw(chart, options) {

      }
    }];

    this.chartReady = true;
  }

  private async getTasksData() {

    let to_do_task_count = 0;
    let in_progress_task_count = 0;
    let done_task_count = 0;
    let overdue_task_count = 0;

    await this.portfolioService.getPortfolioTasks(this.portfolioId, this.period)
      .then((res) => {
        this.tasks = res['tasks'];
        this.overdueTasks = res['overdueTasks'].map(task => {
          task.overdue = true;
          return task;
        });
      });

    for (let task of this.tasks) {
      if (task.task.status=='to do') to_do_task_count++;
      else if (task.task.status=='in progress') in_progress_task_count++;
      else if (task.task.status=='done') done_task_count++;
    }

    overdue_task_count = this.overdueTasks?.length || 0;
    this.task_count = to_do_task_count + in_progress_task_count + done_task_count + overdue_task_count;

    return [to_do_task_count, in_progress_task_count, done_task_count, overdue_task_count];
  }
}
