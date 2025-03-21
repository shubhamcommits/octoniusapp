import { Component, OnInit,Input, Output, EventEmitter } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';

@Component({
  selector: 'app-delete-workspace',
  templateUrl: './delete-workspace.component.html',
  styleUrls: ['./delete-workspace.component.scss']
})
export class DeleteWorkspaceComponent implements OnInit {

  @Input() workspaceData: any;

  @Output() workspaceDeletedEmiter = new EventEmitter();

  constructor(
    private workspaceService : WorkspaceService,
    private utilityService: UtilityService,
  ) { }

  ngOnInit(): void {
  }

  removeWorkspace() {
    this.utilityService.getConfirmDialogAlert($localize`:@@deleteWorkspace.areYouSure:Are you sure?`, $localize`:@@deleteWorkspace.workspaceCompletelyRemoved:By doing this, the workspace be completely removed!`)
      .then((res) => {
        if (res.value) {
          this.utilityService.asyncNotification($localize`:@@deleteWorkspace.pleaseWaitDeletingWorkspace:Please wait we are deleting the workspace...`, new Promise((resolve, reject) => {
            // Remove the step
            this.workspaceService.removeWorkspace(this.workspaceData._id)
              .then((res) => {
                this.workspaceDeletedEmiter.emit();

                resolve(this.utilityService.resolveAsyncPromise($localize`:@@deleteWorkspace.workspaceDeleted:Workspace deleted!`));
              }).catch((err) => {
                reject(this.utilityService.rejectAsyncPromise($localize`:@@deleteWorkspace.unableDeleteWorkspace:Unable to delete the workspace, please try again!`));
              });
          }));
        }
      });
  }
}
