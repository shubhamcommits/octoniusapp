import { Component, OnInit, Input, ChangeDetectionStrategy, Injector, EventEmitter, Output } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';

@Component({
  selector: 'app-workplace-information',
  templateUrl: './workplace-information.component.html',
  styleUrls: ['./workplace-information.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkplaceInformationComponent implements OnInit {

  // Workspace Data Object
  @Input('workspaceData') workspaceData: any = {};

  // Router State Object - can have either 'billing' or 'general'
  @Input('routerState') routerState: string = '';

  @Output() workspaceUpdatedEvent = new EventEmitter();

  editWorkspaceName = false;

  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private workspaceService: WorkspaceService,
    private utilityService: UtilityService,
    private injector: Injector
    ) { }

  ngOnInit() {
  }

  async workspaceNameChange(event: any) {
    await this.utilityService.asyncNotification($localize`:@@workplaceInformation.pleaseWaitUpdatingWorkplaceName:Please wait we are updating the workspace name...`, new Promise(async (resolve, reject) => {
      await this.workspaceService.updateWorkspaceProperties(this.workspaceData._id, { workspace_name: event.target.value })
        .then((res) => {
          this.workspaceUpdatedEvent.emit(res['workspace']);
          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@workplaceInformation.detailsUpdated:Details updated!`));
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@workplaceInformation.unableToUpdateDetails:Unable to update the details, please try again!`));
        });
    }));

    this.editWorkspaceName = !this.editWorkspaceName;
  }
}
