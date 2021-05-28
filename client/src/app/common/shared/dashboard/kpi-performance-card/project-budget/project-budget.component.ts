import { Component, Injector, Input, OnChanges } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';

@Component({
  selector: 'app-project-budget',
  templateUrl: './project-budget.component.html',
  styleUrls: ['./project-budget.component.scss']
})
export class ProjectBudgetComponent implements OnChanges {

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
  //doughnutChartPlugins;

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector)

  constructor(
    private injector: Injector
    ) { }

  ngOnChanges() {
    this.initView();
  }

  async initView() {
    this.project.budget.real_cost = await this.calculateRealCost();
    this.completitionPercentage = await this.getPercentageExpense();

    this.completitionPercentageClass = "badge " + this.setStatusClass(true);
    this.projectStatusClass = this.setStatusClass( false);


    /* Chart Setup */
    this.doughnutChartLabels = ['Budget left', 'Real cost'];
    this.doughnutChartData = [this.project?.budget?.amount_planned - this.project?.budget?.real_cost, this.project?.budget?.real_cost];
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
        '#E4EDF8',
        '#2AA578'
      ]
    }];

    this.chartReady = true;
  }

  setStatusClass(isBadge) {
    if (isBadge) {
      if (this.project?.budget?.amount_planned >= this.project?.budget?.real_cost) {
        return 'badge_on_track';
      } else {
        return 'badge_in_danger';
      }
    } else {
      if (this.project?.budget?.amount_planned >= this.project?.budget?.real_cost) {
        return 'on_track';
      } else {
        return 'in_danger';
      }
    }
  }

  calculateRealCost() {
    let realCost = 0;
    this.project?.budget?.expenses?.forEach(expense => {
      realCost += expense.amount;
    });
    return realCost;
  }

  getPercentageExpense() {
    return  (this.project?.budget?.amount_planned > 0)
      ? Math.round(((this.project?.budget?.real_cost)*100)/(this.project?.budget?.amount_planned))
      : 0;
  }
}
