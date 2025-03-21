import { Component, Injector, Input, OnChanges, OnInit } from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';
import { PublicFunctions } from 'modules/public.functions';
import { DateTime } from 'luxon';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { DatesService } from 'src/shared/services/dates-service/dates.service';

@Component({
  selector: 'app-velocity-card',
  templateUrl: './velocity-card.component.html',
  styleUrls: ['./velocity-card.component.scss']
})
export class VelocityCardComponent implements OnChanges {

  @Input() period;
  @Input() group: string;
  @Input() filteringGroups;

  // Current Workspace Data
  workspaceData: any

  chartReady = false;

  lineChartLabels;
  lineChartData: ChartConfiguration['data'];
  lineChartType: ChartType = 'line';
  lineChartOptions: ChartConfiguration['options'];

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector)

  constructor(
    private injector: Injector,
    private workspaceService: WorkspaceService,
    private datesService: DatesService
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

    const dates = this.getDates();
    const velocityData = await this.getData(dates);

    this.lineChartLabels = this.formatDates(dates);
    this.lineChartData = {
      datasets: [{
        data: velocityData,
        borderColor: '#005FD5',
        backgroundColor: '#FFFFFF',
        pointBorderColor: '#005FD5',
        pointBackgroundColor: '#FFFFFF',
        pointHoverBorderColor: '#005FD5',
        pointHoverBackgroundColor: '#FFFFFF',
      }],
      labels: this.lineChartLabels
    };
    this.lineChartOptions = {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
      },
      scales: {
          y: {
              stacked: true,
              display: false,
              // gridLines: {
              //     drawBorder: false,
              //     display: false,
              // },
          },
          x: {
              stacked: true,
              display: false,
              // gridLines: {
              //     drawBorder: false,
              //     display: false,
              // }
          }
      }
    };
    // this.lineChartColors = [
    //   {
    //     borderColor: '#005FD5',
    //     backgroundColor: '#FFFFFF',
    //   },
    // ];
    // this.lineChartLegend = true;
    // this.lineChartType = 'line';
    // this.lineChartPlugins = [];

    this.chartReady = true;
  }

  getDates() {
    let datesRet = [];
    if (this.period === 7) {
      for (let i = 6; i >= 0; i--) {
        datesRet.push(DateTime.now().minus({ days:  i }).startOf('day'));
      }
    } else if (this.period === 30) {
      for (let i = 11; i > 0; i--) {
        datesRet.push(DateTime.now().minus({ days:  i*(30/12) }).startOf('day'));
      }
      datesRet.push(DateTime.now().minus({ days:  0 }).startOf('day'));
    } else if (this.period === 365) {
      for (let i = 11; i >= 0; i--) {
        datesRet.push(DateTime.now().minus({ months:  i }).startOf('day'));
      }
    }

    return datesRet;
  }

  formatDates(dates) {
    let newDates = [];
    dates.forEach(date => {
      if (this.period === 365) {
        newDates.push(this.datesService.formateDate(date, 'MMM/YYYY'));
      } else {
        newDates.push(this.datesService.formateDate(date, 'YYYY-MM-DD'));
      }
    });
    return newDates;
  }

  getData(dates) {
    return this.workspaceService.getVelocityGroups(this.workspaceData._id, dates, this.filteringGroups, this.group);
  }
}
