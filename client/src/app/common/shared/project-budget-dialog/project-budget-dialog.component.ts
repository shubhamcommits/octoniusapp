import { Component, EventEmitter, Inject, Injector, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment';
import { ColumnService } from 'src/shared/services/column-service/column.service';
import { CountryCurrencyService } from 'src/shared/services/country-currency/country-currency.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-project-budget-dialog',
  templateUrl: './project-budget-dialog.component.html',
  styleUrls: ['./project-budget-dialog.component.scss']
})
export class ProjectBudgetDialogComponent implements OnInit {

  @Output() budgetUpdatedEvent = new EventEmitter();

  columnId: any;
  columnTitle: string;
  budget: any;
  expense: any = {
    amount: 0,
    reason: '',
    date: moment().format(),
    _user: null
  };

  currentUser: any;
  workspaceData;
  groupData;

  currencies = [];

  totalSpent = 0;

  showEditBudget = false;
  showAddExpenseForm = false;
  entryUserArray = [];

  budgetPlaceholder = $localize`:@@projectBudgetDialog.addBudget:Add budget`;
  reasonPlaceholder = $localize`:@@projectBudgetDialog.whatDidYouSpentItOn:What did you spend it on?`;

  chartReady = false;

  completitionPercentage = 0;
  completitionPercentageClass = '';
  projectStatusClass = '';
  doughnutChartLabels = [];
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

  timeTrackingEntities = [];
  timeTrackingEntitiesMapped = [];

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public utilityService: UtilityService,
    private columnService: ColumnService,
    private countryCurrencyService: CountryCurrencyService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private mdDialogRef: MatDialogRef<ProjectBudgetDialogComponent>,
    private injector: Injector
  ) {
    this.columnId = this.data.columnId;
    this.budget = this.data.budget;
    this.columnTitle = this.data.columnTitle;
  }

  async ngOnInit() {
    this.currentUser = await this.publicFunctions.getCurrentUser();
    this.currencies = await this.countryCurrencyService.getCurrencies();
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    this.groupData = await this.publicFunctions.getCurrentGroupDetails();

    if (!this.budget.expenses) {
      this.budget.expenses = [];
    }

    this.budget.expenses.forEach(expense => {
      if (!!expense._resource) {
        const index = (!!expense._resource.activity) ? expense._resource.activity.findIndex(a => a._id == expense._resource_activity) : -1;
        if (index >= 0) {
          expense.resource_quantity = expense._resource.activity[index].quantity;
        }
      }
    });
    
    this.resetExpense();

    // Calculate the total spent
    this.calculateTotalSpent();
    this.initGraphic();
  }

  async initGraphic() {
    if (!this.budget) {
      this.budget  = {
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
    }

    this.completitionPercentage = await this.getPercentageExpense();

    this.completitionPercentageClass = "badge " + this.setStatusClass(true);
    this.projectStatusClass = this.setStatusClass(false);


    /* Chart Setup */
    const spent = this.totalSpent;
    const balance = this.budget?.amount_planned - this.totalSpent;
    this.doughnutChartLabels = [$localize`:@@projectBudgetDialog.cost:Cost`, $localize`:@@projectBudgetDialog.currentBalance:Current Balance`];
    this.doughnutChartData = [spent, balance];
    this.doughnutChartColors = [{
      backgroundColor: [
        (balance >= 0) ? '#005FD5' : '#EB5757',
        (balance >= 0) ? '#2AA578' : '#005FD5'
      ]
    }];

    this.chartReady = true;
  }


  cancel() {
    this.budget = {};
    this.columnId = '';
    // Close the modal
    this.mdDialogRef.close();
  }

  saveBudget() {
    if (!!this.budget?.amount_planned && !!this.budget?.currency) {
      this.utilityService.asyncNotification($localize`:@@projectBudgetDialog.pleaseWaitWeUpdateBudget:Please wait we are updating the budget...`, new Promise((resolve, reject) => {
        this.columnService.saveAmountBudget(this.columnId, this.budget?.amount_planned, this.budget?.currency)
          .then((res) => {
            this.budgetUpdatedEvent.emit(this.budget);
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@projectBudgetDialog.budgetUpdated:Budget updated!`));
          })
          .catch((err) => {
            reject(this.utilityService.rejectAsyncPromise($localize`:@@projectBudgetDialog.unableToUpdateBudget:Unable to update the budget, please try again!`))
          })
      }));

      this.initGraphic();
    }
  }

  saveExpense() {
    if (!this.showAddExpenseForm) {
      this.showAddExpenseForm = !this.showAddExpenseForm;
    } else if (this.expense.amount < 0 || this.expense.reason == '' ) {
      this.utilityService.errorNotification($localize`:@@projectBudgetDialog.amountDescriptionMandatory:Amount and Description are mandatory fields.`);
    } else {
      if (!this.expense._id) {
        this.utilityService.asyncNotification($localize`:@@projectBudgetDialog.pleaseWaitWeSaveNewExpense:Please wait we are saving the new expense...`, new Promise((resolve, reject) => {
          this.columnService.addBudgetExpense(this.columnId, this.expense)
            .then((res) => {
              this.budget.expenses.push(this.expense);
              this.calculateTotalSpent();
              this.resetExpense();

              this.showAddExpenseForm = false;

              this.budgetUpdatedEvent.emit(this.budget);
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@projectBudgetDialog.expenseSaved:Expense saved!`));
            })
            .catch((err) => {
              reject(this.utilityService.rejectAsyncPromise($localize`:@@projectBudgetDialog.unableToSaveExpense:Unable to save the expense, please try again!`))
            })
        }));
      } else {
        this.utilityService.asyncNotification($localize`:@@projectBudgetDialog.pleaseWaitWeSaveExpense:Please wait we are saving the expense...`, new Promise((resolve, reject) => {
          this.columnService.updateBudgetExpense(this.columnId, this.expense)
            .then((res: any) => {
              let index = this.budget.expenses.findIndex((exp: any) => exp._id === this.expense._id);
              this.budget.expenses[index] = this.expense;
              this.calculateTotalSpent();
              this.resetExpense();

              this.showAddExpenseForm = false;

              this.budgetUpdatedEvent.emit(this.budget);
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@projectBudgetDialog.expenseSaved:Expense saved!`));
            })
            .catch((err) => {
              reject(this.utilityService.rejectAsyncPromise($localize`:@@projectBudgetDialog.unableToSaveExpense:Unable to save the expense, please try again!`))
            })
        }));
      }
    }
  }

  removeExpense(expense: any) {
    // Open the Confirm Dialog to ask for permission
    this.utilityService.getConfirmDialogAlert($localize`:@@projectBudgetDialog.areYouSure:Are you sure?`, $localize`:@@projectBudgetDialog.dingThisWillDeleteExpense:By doing this, the expense will be deleted!`)
    .then((res) => {
      if (res.value) {
        this.utilityService.asyncNotification($localize`:@@projectBudgetDialog.pleaseWaitWeDeleteExpense:Please wait we are remove the expense...`, new Promise((resolve, reject) => {
          this.columnService.deleteBudgetExpense(this.columnId, expense._id)
            .then((res) => {
              // Remove the column from the array
              let index = this.budget.expenses.findIndex((exp: any) => exp._id === expense._id);
              this.budget.expenses.splice(index, 1);
              this.calculateTotalSpent();
              this.budgetUpdatedEvent.emit(this.budget);
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@projectBudgetDialog.expenseDeleted:Expense deleted!`));
            })
            .catch((err) => {
              reject(this.utilityService.rejectAsyncPromise($localize`:@@projectBudgetDialog.unableToSaveExpense:Unable to save the expense, please try again!`))
            })
        }));
      }
    });
  }

  editExpense(expense: any) {
    this.expense = expense;

    this.showAddExpenseForm = true;
  }

  resetExpense() {
    this.expense = {
      amount: 0,
      reason: '',
      date: moment().format(),
      _user: this.currentUser
    };

    this.entryUserArray = [this.currentUser];

    this.showAddExpenseForm = false;
  }

  onAssignedAdded(res: any) {
    this.entryUserArray = [res?.assignee];
    this.expense._user = res?.assignee;
  }

  onAssignedRemoved(userId: string) {
    this.entryUserArray = [];
    this.expense._user = null;
  }

  /**
   * This function is responsible for receiving the date from @module <app-date-picker></app-date-picker>
   * @param dateObject
   */
  getDate(dateObject: any) {
    this.expense.date = dateObject.toISOString() || null;
  }

  isValidEntry() {
    return !this.showAddExpenseForm || (!!this.expense && !!this.expense.date && !!this.expense.amount && !!this.expense.reason && !!this.expense._user);
  }

  formateDate(date: any, format: string) {
    return date ? moment.utc(date).format(format) : '';
  }

  calculateTotalSpent() {
    if (!this.totalSpent) {
      this.totalSpent = 0;
    }

    this.budget?.expenses?.forEach(expense => {
      this.totalSpent += expense.amount;
    });
  }

  getBudgetStyle() {
    if ((this.budget.amount_planned - this.totalSpent) < 0) {
      return 'over-budget';
    } else if ((this.budget.amount_planned - this.totalSpent) > 0) {
      return 'under-budget';
    }
  }

  getPercentageExpense() {
    return  (this.budget?.amount_planned > 0)
      ? Math.round(((this.totalSpent)*100)/(this.budget?.amount_planned))
      : 0;
  }

  setStatusClass(isBadge) {
    if (isBadge) {
      if (this.budget?.amount_planned >= this.totalSpent) {
        return 'badge_on_track';
      } else {
        return 'badge_in_danger';
      }
    } else {
      if (this.budget?.amount_planned >= this.totalSpent) {
        return 'on_track';
      } else {
        return 'in_danger';
      }
    }
  }
}
