import { Component, Input, OnInit } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
//import 'chartjs-plugin-labels'


@Component({
  selector: 'app-generic-graph',
  templateUrl: './generic-graph.component.html',
  styleUrls: ['./generic-graph.component.scss']
})
export class GenericGraphComponent implements OnInit {


  // Width
  @Input('width') public width = 0

  // Height
  @Input('height') public height = 0

  // Labels
  @Input('labels') public labels = []

  // Datasets
  @Input('datasets') public datasets: any = []

  // Data
  @Input('data') public data = []

  // Chart Type - by default 'bar', other options - bar, line, radar, pie, doughnut
  @Input('chartType') public chartType = 'bar'

  // Options
  @Input('options') public options: any = {
    legend: {
      display: false
    }
  }

  // Show Graph Status
  showGraph = false

  // Columns List
  @Input('columns') columns: any = []

  // Sheet Data
  @Input('sheetData') sheetData = []
  
  constructor(
    public utilityService: UtilityService
    ) { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.compute()
  }

  changeChartType(value) {
  }

  /**
   * Format Number
   * @param labelValue
   * @returns
   */
  public formatNumber(labelValue: any) {

    // Nine Zeroes for Billions
    return Math.abs(Number(labelValue)) >= 1.0e+7

      ? Number(Math.abs(Number(labelValue)) / 1.0e+7).toFixed(2) + "Cr"
      // Six Zeroes for Millions
      : Number(Math.abs(Number(labelValue)) >= 1.0e+5).toFixed(2)

        ? Number(Math.abs(Number(labelValue)) / 1.0e+5).toFixed(2) + "L"
        // Three Zeroes for Thousands
        : Number(Math.abs(Number(labelValue)) >= 1.0e+3).toFixed(2)

          ? Number(Math.abs(Number(labelValue)) / 1.0e+3).toFixed(2) + "K"

          : Number(Math.abs(Number(labelValue))).toFixed(2)
  }

  compute() {
    this.chartType = this.chartType
    this.datasets = this.datasets
    this.data = this.data
  }

  changeBaseColumn(event) {
    this.labels = this.sheetData.map(element => element[event]).slice(0,9)
  }

  changeValueColumn(event) {
    this.data = this.sheetData.map(element => element[event]).slice(0,9)
  }

}
