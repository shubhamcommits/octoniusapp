import { Component, EventEmitter, Inject, Injector, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment';
import { ColumnService } from 'src/shared/services/column-service/column.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-project-budget-dialog',
  templateUrl: './project-budget-dialog.component.html',
  styleUrls: ['./project-budget-dialog.component.scss']
})
export class ProjectBudgetDialogComponent implements OnInit {

  @Output() closeEvent = new EventEmitter();

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

  types = ['USD', 'EUR'];

  totalSpent = 0;

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public utilityService: UtilityService,
    private columnService: ColumnService,
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
    this.resetExpense();

    if (!this.budget.expenses) {
      this.budget.expenses = [];
    }

    // Calculate the total spent
    this.calculateTotalSpent();
  }


  cancel() {
    this.budget = {};
    this.columnId = '';
    // Close the modal
    this.mdDialogRef.close();
  }

  saveBudget() {
    this.utilityService.asyncNotification('Please wait we are updating the budget...', new Promise((resolve, reject) => {
      this.columnService.saveAmountBudget(this.columnId, this.budget?.amount_planned, this.budget?.currency)
        .then((res) => {
          resolve(this.utilityService.resolveAsyncPromise('Budget updated!'));
        })
        .catch((err) => {
          reject(this.utilityService.rejectAsyncPromise('Unable to update the budget, please try again!'))
        })
    }));
  }

  saveExpense() {
    if (this.expense.amount < 0 || this.expense.reason == '' ) {
      this.utilityService.errorNotification('Amount and Description are mandatory fields.');
    } else {
      if (!this.expense._id) {
        this.expense._user = this.currentUser;
        this.utilityService.asyncNotification('Please wait we are saving the new expense...', new Promise((resolve, reject) => {
          this.columnService.addBudgetExpense(this.columnId, this.expense)
            .then((res) => {
              this.budget.expenses.unshift(this.expense);
              this.calculateTotalSpent();
              this.resetExpense();
              resolve(this.utilityService.resolveAsyncPromise('Expense saved!'));
            })
            .catch((err) => {
              reject(this.utilityService.rejectAsyncPromise('Unable to save the expense, please try again!'))
            })
        }));
      } else {
        this.utilityService.asyncNotification('Please wait we are saving the expense...', new Promise((resolve, reject) => {
          this.columnService.updateBudgetExpense(this.columnId, this.expense)
            .then((res) => {
              let index = this.budget.expenses.findIndex((exp: any) => exp._id === this.expense._id);
              this.budget.expenses[index] = this.expense;
              this.calculateTotalSpent();
              this.resetExpense();
              resolve(this.utilityService.resolveAsyncPromise('Expense saved!'));
            })
            .catch((err) => {
              reject(this.utilityService.rejectAsyncPromise('Unable to save the expense, please try again!'))
            })
        }));
      }
    }
  }

  editExpense(expense: any) {
    this.expense = expense;
  }

  removeExpense(expense: any) {
    // Open the Confirm Dialog to ask for permission
    this.utilityService.getConfirmDialogAlert('Are you sure?', 'By doing this, the expense will be deleted!')
    .then((res) => {
      if (res.value) {
        this.utilityService.asyncNotification('Please wait we are remove the expense...', new Promise((resolve, reject) => {
          this.columnService.deleteBudgetExpense(this.columnId, expense._id)
            .then((res) => {
              // Remove the column from the array
              let index = this.budget.expenses.findIndex((exp: any) => exp._id === expense._id);
              this.budget.expenses.splice(index, 1);
              this.calculateTotalSpent();
              resolve(this.utilityService.resolveAsyncPromise('Expense deleted!'));
            })
            .catch((err) => {
              reject(this.utilityService.rejectAsyncPromise('Unable to save the expense, please try again!'))
            })
        }));
      }
    });
  }

  resetExpense() {
    this.expense = {
      amount: 0,
      reason: '',
      date: moment().format(),
      _user: this.currentUser
    };
  }

  formateDate(date: any, format: string) {
    return date ? moment.utc(date).format(format) : '';
  }

  calculateTotalSpent() {
    this.totalSpent = 0;
    this.budget.expenses.forEach(expense => {
      this.totalSpent += expense.amount;
    });
  }
}
