import { Component, Injector, Input, OnChanges } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

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
    private groupService: GroupService,
    private utilityService: UtilityService,
    private injector: Injector
    ) { }

  async ngOnChanges() {
    await this.initTimeTrackingEntities();
    this.initView();
  }

  async initTimeTrackingEntities() {
    let timeTrackingEntities = [];
    await this.groupService.getSectionTimeTrackingEntities(this.project?._id).then(res => {
      timeTrackingEntities = res['timeTrackingEntities'];
    });

    timeTrackingEntities.forEach(tte => {
      tte?.times?.forEach(time => {
        this.project.budget.expenses.push({
          amount: time.cost
        });
      });
    });

    this.project.budget.expenses = await this.utilityService.removeDuplicates([...this.project.budget.expenses], '_id');
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
    // if (this.completitionPercentage > 100) {
    //   this.doughnutChartLabels = [$localize`:@@projectBudget.realCost:Real cost`];
    //   this.doughnutChartData = [this.project?.budget?.real_cost];
    //   this.doughnutChartColors = [{
    //     backgroundColor: [
    //       '#EB5757'
    //     ]
    //   }];
    // } else if(!noBudget) {
    //   this.doughnutChartLabels = [$localize`:@@projectBudget.budgetLeft:Budget left`, $localize`:@@projectBudget.realCost:Real cost`];
    //   this.doughnutChartData = [this.project?.budget?.amount_planned - this.project?.budget?.real_cost, this.project?.budget?.real_cost];
    //   this.doughnutChartColors = [{
    //     backgroundColor: [
    //       '#E4EDF8',
    //       '#2AA578'
    //     ]
    //   }];
      const balance = this.project?.budget?.amount_planned - this.project?.budget?.real_cost;
      this.doughnutChartLabels = [$localize`:@@projectBudget.cost:Cost`, $localize`:@@projectBudget.currentBalance:Current Balance`];
      this.doughnutChartData = [this.project?.budget?.real_cost, balance];
      this.doughnutChartColors = [{
        backgroundColor: [
          (balance >= 0) ? '#26A69A' : '#EB5757',
          (balance >= 0) ? '#26A69A' : '#005FD5'
        ]
      }];
    // }

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
