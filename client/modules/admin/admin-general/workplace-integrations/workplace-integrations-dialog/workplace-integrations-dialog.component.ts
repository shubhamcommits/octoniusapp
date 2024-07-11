import { Component, OnInit, Inject, Injector, Output, EventEmitter } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { PublicFunctions } from 'modules/public.functions';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';

@Component({
    selector: 'app-workplace-integrations-dialog',
    templateUrl: './workplace-integrations-dialog.component.html',
    styleUrls: ['./workplace-integrations-dialog.component.scss']
  })
  export class WorkplaceIntegrationsDialogComponent implements OnInit {

    @Output() closeEvent = new EventEmitter();

    workspaceData;

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
      this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

      if (!this.workspaceData?.integrations) {
        this.workspaceData.integrations = {
          is_google_connected: false,
          is_azure_ad_connected: false,
          is_ldap_connected: false,
          is_slack_connected: false,
          is_box_connected: false,
          is_atlassia_connected: false
        }
        this.publicFunctions.sendUpdatesToWorkspaceData(this.workspaceData);
      }
    }

    onCloseDialog() {
      this.closeEvent.emit();
      this.mdDialogRef.close();
    }

    saveSettings() {
      this.utilityService.asyncNotification($localize`:@@workspaceIntegrationsDialog.pleaseWaitsavingSettings:Please wait we are saving the new setting...`,
        new Promise((resolve, reject)=>{
          this.workspaceService.saveSettings(this.workspaceData?._id, {integrations: this.workspaceData?.integrations})
            .then(()=> {
              this.publicFunctions.sendUpdatesToWorkspaceData(this.workspaceData);
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@workspaceIntegrationsDialog.settingsSaved:Settings saved to your workplace!`));
            })
            .catch((err) => {
              reject(this.utilityService.rejectAsyncPromise($localize`:@@workspaceIntegrationsDialog.unableToSaveWorkplaceSettings:Unable to save the settings to your workplace, please try again!`))
            });
      }));
    }
}
