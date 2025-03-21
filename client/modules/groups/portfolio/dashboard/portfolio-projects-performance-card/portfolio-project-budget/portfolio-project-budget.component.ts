import { Component, Injector, Input, OnChanges } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { PublicFunctions } from 'modules/public.functions';

@Component({
  selector: 'app-portfolio-project-budget',
  templateUrl: './portfolio-project-budget.component.html',
  styleUrls: ['./portfolio-project-budget.component.scss']
})
export class PortfolioProjectBudgetComponent implements OnChanges {

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

  doughnutChartLabels = ['Real cost'];
  public doughnutChartData: ChartData<'doughnut'>;
  public doughnutChartType = 'doughnut' as const;
  public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'];
  public doughnutChartPlugins;

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector)

  constructor(
    private injector: Injector
    ) { }

  ngOnChanges() {
    this.initView();
  }

  async initView() {
    let noBudget = false;
    if (!this.project.budget) {
      this.project.budget  = {
        real_cost: 0,
        amount_planned: 0
      }
      this.doughnutChartPlugins = [{
        beforeDraw(chart) {
          const ctx = chart.ctx;

          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
          const centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);

          ctx.font = '25px Nunito';
          ctx.fillStyle = '#9d9fa1';

          ctx.fillText('No Budget', centerX, centerY);
        }
      }];
      noBudget = true;
    } else {
      this.project.budget.real_cost = await this.calculateRealCost();
    }
    this.completitionPercentage = await this.getPercentageExpense();

    this.completitionPercentageClass = "badge " + this.setStatusClass(true);
    this.projectStatusClass = this.setStatusClass(false);


    /* Chart Setup */
    if (this.completitionPercentage > 100) {
      this.doughnutChartLabels = [$localize`:@@projectBudget.realCost:Real cost`];
      this.doughnutChartData = {
        labels: this.doughnutChartLabels,
        datasets: [
          {
            data: [this.project?.budget?.real_cost],
            backgroundColor: ['#EB5757'],
          }
        ]
      };
    } else if(!noBudget) {
      this.doughnutChartLabels = [$localize`:@@projectBudget.budgetLeft:Budget left`, $localize`:@@projectBudget.realCost:Real cost`];
      this.doughnutChartData = {
        labels: this.doughnutChartLabels,
        datasets: [
          {
            data: [this.project?.budget?.amount_planned - this.project?.budget?.real_cost, this.project?.budget?.real_cost],
            backgroundColor: ['#E4EDF8', '#2AA578'],
          }
        ]
      };
    }

    this.doughnutChartOptions = {
      cutout: 60,
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
      }
    };

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
