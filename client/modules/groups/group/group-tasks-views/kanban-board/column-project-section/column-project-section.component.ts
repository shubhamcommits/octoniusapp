import { Component, OnInit, Input, Output, EventEmitter, Injector } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import moment from 'moment';
import { ProjectBudgetDialogComponent } from 'src/app/common/shared/project-budget-dialog/project-budget-dialog.component';
import { ColumnService } from 'src/shared/services/column-service/column.service';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-column-project-section',
  templateUrl: './column-project-section.component.html',
  styleUrls: ['./column-project-section.component.scss']
})
export class ColumnProjectSectionComponent implements OnInit {

  @Input() column;
  @Input() userData;
  @Input() groupData;

  totalSpent = 0;

  canSeeBudget = false;

  constructor(
    public utilityService: UtilityService,
    private columnService: ColumnService,
    private groupService: GroupService,
    public dialog: MatDialog
  ) { }

  async ngOnInit() {
    await this.calculateHoursSpent();

    await this.calculateTotalSpent();

    this.canSeeBudget = this.userData?.role == 'owner' || this.userData?.role == 'admin' || this.userData?.role == 'manager'
    || (this.groupData?._admins.findIndex((admin: any) => (admin._id || admin) == this.userData?._id)>=0);
  }

  async calculateHoursSpent() {
    let timeTrackingEntities = [];
    await this.groupService.getSectionTimeTrackingEntities(this.column?._id).then(res => {
      timeTrackingEntities = res['timeTrackingEntities'];
    });

    this.column.hours_logged = 0;
    this.column.minutes_logged = 0;

    timeTrackingEntities.forEach(tte => {
      tte?.times?.forEach(time => {
        this.column.hours_logged += parseInt(time.hours);
        this.column.minutes_logged += parseInt(time.minutes);

        const extraHours = Math.floor(this.column.minutes_logged / 60);

        this.column.hours_logged += extraHours;
        this.column.minutes_logged %= 60;

        let tteMapped = {
          _id: time._id,
          _user: tte._user,
          _task: tte._task,
          _category: tte._category,
          date: time.date,
          hours: time.hours,
          minutes: time.minutes,
          reason: time.comment,
          amount: time.cost,
          isTT: true
        };

        this.column.budget.expenses.push(tteMapped);
      });
    });

    this.column.budget.expenses = await this.utilityService.removeDuplicates([...this.column.budget.expenses], '_id');
    this.column.budget.expenses.sort((e1, e2) => (moment(e1.date).isAfter(moment(e2.date))) ? -1 : 1);
  }

  calculateTotalSpent() {
    if (!this.totalSpent) {
      this.totalSpent = 0;
    }

    this.column.budget?.expenses?.forEach(expense => {
      this.totalSpent += expense.amount;
    });
  }

  newBudget(columnId: string, initialBudget: number) {

    this.utilityService.asyncNotification($localize`:@@columnProjectSection.pleaseWaitUpdatingProject:Please wait we are updating the project...`, new Promise((resolve, reject) => {
      this.columnService.saveAmountBudget(columnId, initialBudget)
        .then((res) => {
          this.column.budget = {
            amount_planned: initialBudget,
            totalSpent: 0
          }
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@columnProjectSection.projectUpdated:Project updated!`));
        })
        .catch((err) => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@columnProjectSection.unableToUpdateColumn:Unable to update the column, please try again!`))
        })
    }));
  }

  openBudgetDialog(column) {
    if (this.canSeeBudget) {
      const data = {
        columnId: column?._id,
        budget: column?.budget,
        columnTitle: column?.title
      }

      const dialogRef = this.dialog.open(ProjectBudgetDialogComponent, {
        data: data,
        panelClass: 'groupCreatePostDialog',
        minWidth: '100%',
      width: '100%',
        minHeight: '100%',
      height: '100%',
        disableClose: true,
        hasBackdrop: true
      });

      const budgetUpdatedEventSubs = dialogRef.componentInstance.budgetUpdatedEvent.subscribe((data) => {
        this.column.budget = data;
        this.calculateTotalSpent();
      });


      dialogRef.afterClosed().subscribe(result => {
        budgetUpdatedEventSubs.unsubscribe();
      });
    }
  }

  getBudgetStyle() {
    if (this.column.budget.amount_planned - this.column?.budget?.totalSpent < 0) {
      return 'over-budget';
    } else if (this.column.budget.amount_planned - this.column?.budget?.totalSpent > 0) {
      return 'under-budget';
    }
  }

  formateDate(date: any, format: string) {
    return date ? moment.utc(date).format(format) : '';
  }

  isDelay(realDueDate: any, dueDate: any) {
    return moment(realDueDate).isAfter(moment(dueDate), 'day');
  }
}
