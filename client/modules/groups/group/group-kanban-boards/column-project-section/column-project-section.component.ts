import { Component, OnInit, Input, Output, EventEmitter, Injector } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import moment from 'moment';
import { ProjectBudgetDialogComponent } from 'src/app/common/shared/project-budget-dialog/project-budget-dialog.component';
import { ColumnService } from 'src/shared/services/column-service/column.service';
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

  canSeeBudget = false;

  constructor(
    public utilityService: UtilityService,
    private columnService: ColumnService,
    public dialog: MatDialog
  ) { }

  async ngOnInit() {
    this.canSeeBudget = this.userData?.role == 'owner' || this.userData?.role == 'admin' || this.userData?.role == 'manager'
    || (this.groupData?._admins.findIndex((admin: any) => (admin._id || admin) == this.userData?._id)>=0);
  }

  formateDate(date: any, format: string) {
    return date ? moment.utc(date).format(format) : '';
  }

  isDelay(realDueDate: any, dueDate: any) {
    return moment(realDueDate).isAfter(moment(dueDate), 'day');
  }

  newBudget(columnId: string, initialBudget: number) {

    this.utilityService.asyncNotification($localize`:@@columnProjectSection.pleaseWaitUpdatingProject:Please wait we are updating the project...`, new Promise((resolve, reject) => {
      this.columnService.saveAmountBudget(columnId, initialBudget)
        .then((res) => {
          this.column.budget = {
            amount_planned: initialBudget
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
        width: '100%',
        height: '100%',
        disableClose: true,
        hasBackdrop: true
      });

      const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe((data) => {
        this.column.budget = data['budget'];
      });


      dialogRef.afterClosed().subscribe(result => {
        closeEventSubs.unsubscribe();
      });
    }
  }
}
