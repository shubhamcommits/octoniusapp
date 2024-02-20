import { Component, Injector, Input, AfterViewInit } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';

@Component({
  selector: 'app-project-budget',
  templateUrl: './project-budget.component.html',
  styleUrls: ['./project-budget.component.scss']
})
export class ProjectBudgetComponent implements AfterViewInit {

  @Input() project: any;
  @Input() timeTrackingEntities: any = [];

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
  doughnutChartData = [0];
  doughnutChartType = 'doughnut';
  doughnutChartOptions = {
    cutoutPercentage: 75,
    responsive: true,
    legend: {
      display: false
    }
  };
  doughnutChartColors = [{
    backgroundColor: [
      '#2AA578'
    ]
  }];
  doughnutChartPlugins = [];

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector)

  constructor(
    private injector: Injector
    ) { }

  async ngAfterViewInit() {
    await this.initView();
  }

  async initView() {
    // let noBudget = false;
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
      // noBudget = true;
    } else {
      this.project.budget.real_cost = await this.calculateRealCost();
    }
    this.completitionPercentage = await this.getPercentageExpense();

    this.completitionPercentageClass = "badge " + this.setStatusClass(true);
    this.projectStatusClass = this.setStatusClass(false);


    /* Chart Setup */
    const balance = this.project?.budget?.amount_planned - this.project?.budget?.real_cost;
    this.doughnutChartLabels = [$localize`:@@projectBudget.cost:Cost`, $localize`:@@projectBudget.currentBalance:Current Balance`];
    this.doughnutChartData = [this.project?.budget?.real_cost, balance];
    this.doughnutChartColors = [{
      backgroundColor: [
        (balance >= 0) ? '#005FD5' : '#EB5757',
        (balance >= 0) ? '#2AA578' : '#005FD5'
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

    this.timeTrackingEntities?.forEach(entity => {
      realCost += entity.amount;
    });

    return realCost;
  }

  getPercentageExpense() {
    return  (this.project?.budget?.amount_planned > 0)
      ? Math.round(((this.project?.budget?.real_cost)*100)/(this.project?.budget?.amount_planned))
      : 0;
  }
}
