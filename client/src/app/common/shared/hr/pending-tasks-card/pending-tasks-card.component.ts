import { Component, Injector, Input, OnChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EditMemberPayrollDialogComponent } from 'modules/organization/hr/employees/edit-member-payroll-dialog/edit-member-payroll-dialog.component';
import { PublicFunctions } from 'modules/public.functions';
import { HRService } from 'src/shared/services/hr-service/hr.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';

@Component({
  selector: 'app-pending-tasks-card',
  templateUrl: './pending-tasks-card.component.html',
  styleUrls: ['./pending-tasks-card.component.scss']
})
export class PendingTasksCardComponent implements OnChanges {

  @Input() userData;
  @Input() workspaceData;

  pendingTasks = [];
  totalPendingNotifications = 0;

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  // Utility Service
  public utilityService = this.injector.get(UtilityService);

  constructor(
    private hrService: HRService,
    private workspaceService: WorkspaceService,
    private router: Router,
    private injector: Injector,
    public dialog: MatDialog
  ) { }

  async ngOnChanges() {
    await this.initNotifications();
  }

  async initNotifications() {
    await this.hrService.getTopHRPendingNotifications(this.workspaceData?._id).then(res => {
      this.pendingTasks = res['notifications'];
      this.totalPendingNotifications = res['totalCount']
    });
  }

  openUserProfile(userId: string) {
    const dialogRef = this.dialog.open(EditMemberPayrollDialogComponent, {
      data: {
        memberId: userId
      },
      width: '65%',
      height: '75%',
      disableClose: true,
      hasBackdrop: true
    });

    // const memberEditedEventSubs = dialogRef.componentInstance.memberEditedEvent.subscribe((data) => {
    //   this.initUsersTable();
    // });

    dialogRef.afterClosed().subscribe(result => {
      // memberEditedEventSubs.unsubscribe();
    });
  }

  markAsCompleted(notificationId: string) {
    this.utilityService.getConfirmDialogAlert($localize`:@@pendingTasksCard.areYouSure:Are you sure?`, $localize`:@@pendingTasksCard.completelyRemoved:By doing this, the task will be marked as Done!`)
      .then((res) => {
        if (res.value) {
          this.utilityService.asyncNotification($localize`:@@pendingTasksCard.pleaseWaitDeleting:Please wait we are deleting the holiday...`, new Promise((resolve, reject) => {
            this.hrService.markNotificationAsDone(notificationId).then(async res => {
              await this.initNotifications();

              resolve(this.utilityService.resolveAsyncPromise($localize`:@@pendingTasksCard.deleted:Holiday deleted!`));
              // window.location.reload();
            }).catch((err) => {
              reject(this.utilityService.rejectAsyncPromise($localize`:@@pendingTasksCard.unableDeleteHoliday:Unable to delete the holiday, please try again!`));
            });
          }));
        }
      });
  }
}
