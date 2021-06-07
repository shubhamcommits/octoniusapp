import { Component, Injector, Input, OnChanges, OnInit } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';

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

  lineChartData;
  lineChartType;
  lineChartLabels;
  lineChartOptions;
  lineChartColors;
  lineChartLegend;
  lineChartPlugins;

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector)

  constructor(
    private injector: Injector,
    private workspaceService: WorkspaceService
    ) { }

  ngOnChanges() {
    this.initView();
  }

  async initView() {

    if (this.filteringGroups) {
      this.filteringGroups = this.filteringGroups.map(group => group._id);
    }

    // Call the HTTP API to fetch the current workspace details
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    const dates = this.getDates();
    const velocityData = await this.getData(dates);

    this.lineChartData = velocityData;
    this.lineChartLabels = this.formatDates(dates);
    this.lineChartOptions = {
      responsive: true,
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
      }
    };
    this.lineChartColors = [
      {
        borderColor: '#005FD5',
        backgroundColor: '#FFFFFF',
      },
    ];
    this.lineChartLegend = true;
    this.lineChartType = 'line';
    this.lineChartPlugins = [];

    this.chartReady = true;
  }

  getDates() {
    let datesRet = [];
    if (this.period === 7) {
      for (let i = 6; i >= 0; i--) {
        datesRet.push(moment().subtract(i, 'days').startOf('day'));
      }
    } else if (this.period === 30) {
      for (let i = 11; i > 0; i--) {
        datesRet.push(moment().subtract(i*(30/12), 'days').startOf('day'));
      }
      datesRet.push(moment().subtract(0, 'days').startOf('day'));
    } else if (this.period === 365) {
      for (let i = 11; i >= 0; i--) {
        datesRet.push(moment().subtract(i, 'months').startOf('day'));
      }
    }

    return datesRet;
  }

  formatDates(dates) {
    let newDates = [];
    dates.forEach(date => {
      if (this.period === 365) {
        newDates.push(date.format('MMM/YYYY'));
      } else {
        newDates.push(date.format('YYYY-MM-DD'));
      }
    });
    return newDates;
  }

  getData(dates) {
    return this.workspaceService.getVelocityGroups(this.workspaceData._id, dates, this.filteringGroups, this.group);
  }
}
