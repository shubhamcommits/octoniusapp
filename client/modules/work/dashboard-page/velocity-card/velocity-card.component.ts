import { Component, Injector, Input, OnChanges, OnInit } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';

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

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector)

  constructor(private injector: Injector) { }

  ngOnChanges() {
    this.initView();
  }

  async initView() {

    this.lineChartType = 'bar';
    this.lineChartData = [{
      label: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
			datasets: [{
				label: 'My First dataset',
				borderColor: '#FFAB00',
        backgroundColor: '#FFAB00',
				fill: false,
				data: [
          10, 15, 5, 7, 10, 2
				],
				yAxisID: 'y',
			}, {
				label: 'My Second dataset',
				borderColor: '#0bc6a0',
				backgroundColor: '#0bc6a0',
				fill: false,
				data: [
					1, 5, 15, 5, 5, 10
				],
				yAxisID: 'y1'
      }]
    }];

    this.lineChartOptions = {
      legend: {
        display: false
      },
      responsive: true,
      hoverMode: 'index',
      stacked: false,
      title: {
        display: false
      },
      scales: {
        y: {
          type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
          display: true,
          position: 'left',
          gridLines: {
            drawBorder: false,
            display: false,
            drawOnChartArea: false,
          }
        },
        y1: {
          type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
          display: true,
          position: 'right',

          // grid line settings
          gridLines: {
            drawBorder: false,
            display: false,
            drawOnChartArea: false, // only want the grid lines for one axis to show up
          },
        },
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
          },
        }]
      }
    };

    this.chartReady = true;
  }

}
