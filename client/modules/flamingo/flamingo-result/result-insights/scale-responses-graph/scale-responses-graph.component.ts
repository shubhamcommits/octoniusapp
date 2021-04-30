import { Component, Injector, Input, OnChanges } from '@angular/core';

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
  barChartData;
  barChartType;
  barChartOptions;
  barChartColors;
  barChartPlugins;

  constructor() { }

  ngOnChanges() {
    this.initView();
  }

  async initView() {

    /* Chart Setup */
    this.sizes = Array.from(new Array(this.question.scale.size), (x,i) => i);
    this.countsData = await this.getCountsData();
    await this.getPercentagesData();

    this.barChartLabels = this.sizes;
    this.barChartData = this.countsData;
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
              display: true,
              gridLines: {
                  drawBorder: false,
                  display: false,
              }
          }]
      },
    };
    this.barChartColors = [{
        backgroundColor: ['#7FA3FF', '#3252F7', '#536DF9', '#005FD5', '#17B2E3', '#FBB732', '#EE5D5D', '#9D9FA1', '#E4EDF8', '#17B2E3', '#CACACA']
      }];
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
    this.countsData.forEach(count => {this.percentages?.push((count*100/this.responses?.length))});
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
