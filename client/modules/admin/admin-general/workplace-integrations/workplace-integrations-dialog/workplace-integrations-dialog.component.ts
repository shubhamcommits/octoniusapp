import { Component, OnInit, Inject, Injector, Output, EventEmitter } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { PublicFunctions } from 'modules/public.functions';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';

@Component({
    selector: 'app-workplace-integrations-dialog',
    templateUrl: './workplace-integrations-dialog.component.html',
    styleUrls: ['./workplace-integrations-dialog.component.scss']
  })
  export class WorkplaceIntegrationsDialogComponent implements OnInit {

    @Output() closeEvent = new EventEmitter();

    workplaceData;

    // PUBLIC FUNCTIONS
    public publicFunctions = new PublicFunctions(this.injector);

    constructor(
        private injector: Injector,
        private utilityService: UtilityService,
        private workspaceService: WorkspaceService,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private mdDialogRef: MatDialogRef<WorkplaceIntegrationsDialogComponent>
        ) { }

    async ngOnInit(): Promise<void> {
      this.workplaceData = await this.publicFunctions.getCurrentWorkspace();

      if (!this.workplaceData?.integrations) {
        this.workplaceData.integrations = {
          is_google_connected: false,
          is_azure_ad_connected: false,
          is_ldap_connected: false,
          is_slack_connected: false
        }
        this.publicFunctions.sendUpdatesToWorkspaceData(this.workplaceData);
      }
    }

    onCloseDialog() {
      this.closeEvent.emit();
    }

    saveSettings() {
      this.utilityService.asyncNotification($localize`:@@workspaceIntegrationsDialog.pleaseWaitsavingSettings:Please wait we are saving the new setting...`,
        new Promise((resolve, reject)=>{
          this.workspaceService.saveSettings(this.workplaceData?._id, {integrations: this.workplaceData?.integrations})
            .then(()=> {
              this.publicFunctions.sendUpdatesToWorkspaceData(this.workplaceData);
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@workspaceIntegrationsDialog.settingsSaved:Settings saved to your workplace!`));
            })
            .catch((err) => {
              reject(this.utilityService.rejectAsyncPromise($localize`:@@workspaceIntegrationsDialog.unableToSaveWorkplaceSettings:Unable to save the settings to your workplace, please try again!`))
            });
      }));
    }
}
