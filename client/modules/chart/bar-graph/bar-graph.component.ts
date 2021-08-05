import { Component, Input, OnInit } from '@angular/core';
//import 'chartjs-plugin-labels'

@Component({
  selector: 'app-bar-graph',
  templateUrl: './bar-graph.component.html',
  styleUrls: ['./bar-graph.component.scss']
})
export class BarGraphComponent implements OnInit {

  // Width
  @Input('width') width = 0

  // Height
  @Input('height') height = 0

  // Labels
  @Input('labels') public labels = [65, 59, 80, 81, 56, 55, 40]

  // Datasets
  @Input('datasets') datasets: any = []

  // Data
  public data = []

  // Chart Type
  public chartType = 'bar'

  // Options
  public options: any = {
    plugins: {
      labels: {
        render: 'value',
        fontStyle: 'bold',
      },
    }
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

  ngOnInit() {
    this.data = this.datasets
  }

  ngOnChanges() {
    this.data = this.datasets
  }

}
