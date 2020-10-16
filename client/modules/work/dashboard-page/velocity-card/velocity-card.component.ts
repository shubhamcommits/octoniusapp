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

    // Call the HTTP API to fetch the current workspace details
    this.workspaceData = await this.publicFunctions.getWorkspaceDetailsFromHTTP();

    const dates = this.getDates();

    this.lineChartData = this.getData(dates);
    this.lineChartLabels = dates;
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
        datesRet.push(moment().subtract(i, 'days').endOf('day').format('YYYY-MM-DD'));
      }
    } else if (this.period === 30) {
      for (let i = 11; i > 0; i--) {
        datesRet.push(moment().subtract(i*(30/12), 'days').endOf('day').format('YYYY-MM-DD'));
      }
      datesRet.push(moment().subtract(0, 'days').endOf('day').format('YYYY-MM-DD'));
    } else if (this.period === 365) {
      for (let i = 11; i >= 0; i--) {
        datesRet.push(moment().subtract(i, 'months').endOf('day').format('MMM/YYYY'));
      }
    }

    return datesRet;
  }

  getData(dates) {
    //this.workspaceService.getVelocityGroups(this.workspaceData._id, dates, this.period);
    return [65, 59, 80, 81, 56, 55, 40, 60, 32, 45, 55, 63];
  }
}
