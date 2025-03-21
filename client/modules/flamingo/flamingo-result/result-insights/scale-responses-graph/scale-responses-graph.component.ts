import { Component, Injector, Input, OnChanges } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-scale-responses-graph',
  templateUrl: './scale-responses-graph.component.html',
  styleUrls: ['./scale-responses-graph.component.scss']
})
export class ScaleResponsesGraphComponent implements OnChanges {

  @Input() responses;
  @Input() question;

  chartReady = false;

  sizes = [];
  countsData = [];
  percentages = [];

  barChartLabels;
  barChartData: ChartData<'bar'>;
  barChartType = 'bar' as const;
  barChartOptions: ChartConfiguration<'bar'>['options'];
  barChartPlugins;

  constructor(
    public utilityService: UtilityService
  ) { }

  ngOnChanges() {
    this.initView();
  }

  async initView() {

    /* Chart Setup */
    this.sizes = Array.from(new Array(this.question.scale.size), (x,i) => i);
    this.countsData = await this.getCountsData();
    await this.getPercentagesData();

    this.barChartLabels = this.sizes;
    this.barChartData = {
      labels: this.barChartLabels,
      datasets: [
        {
          data: this.countsData,
          backgroundColor: ['#17B2E3', '#17B2E3', '#17B2E3', '#17B2E3', '#17B2E3', '#17B2E3', '#17B2E3', '#17B2E3', '#17B2E3', '#17B2E3', '#17B2E3']
         }
      ],
    }
    this.barChartType = 'bar';
    // this.barChartOptions = {
    //   legend: {
    //     display: false
    //   },
    //   scales: {
    //       yAxes: [{
    //           stacked: true,
    //           display: false,
    //           gridLines: {
    //               drawBorder: false,
    //               display: false,
    //           },
    //       }],
    //       xAxes: [{
    //           stacked: true,
    //           display: true,
    //           gridLines: {
    //               drawBorder: false,
    //               display: false,
    //           }
    //       }]
    //   },
    //   backgroundColor: ['#17B2E3', '#17B2E3', '#17B2E3', '#17B2E3', '#17B2E3', '#17B2E3', '#17B2E3', '#17B2E3', '#17B2E3', '#17B2E3', '#17B2E3']
    // };
    this.barChartOptions = {
      // We use these empty structures as placeholders for dynamic theming.
      scales: {
        x: {
          display: true
        },
        y: {
          display: false
        },
      },
      plugins: {
        legend: {
          display: false,
        }
      },
    };
    // this.barChartColors = [{
    //     backgroundColor: ['#17B2E3', '#17B2E3', '#17B2E3', '#17B2E3', '#17B2E3', '#17B2E3', '#17B2E3', '#17B2E3', '#17B2E3', '#17B2E3', '#17B2E3']
    //   }];
    this.barChartPlugins = [{
      beforeDraw(chart, options) {

      }
    }];

    this.chartReady = true;
  }
  /**
   * Obtains the percentages of each answer
   */
  private async getPercentagesData() {
    this.percentages = [];

    this.countsData.forEach(count => {this.percentages?.push((Math.round(((count*100/this.responses?.length) + Number.EPSILON) * 100) / 100))});
  }

  /**
   * Get the number of response for each option
   * @returns
   */
  private async getCountsData() {
    return Array.from(new Array(this.question.scale.size), (x,i) => this.getScaleResponseCount(i));
  }

  /**
   * Get the number of response for an specific size
   * @param size
   * @returns
   */
  getScaleResponseCount(size: any) {
    return this.responses?.filter(response => {
      return response.scale_answer == size
    }).length;
  }
}
