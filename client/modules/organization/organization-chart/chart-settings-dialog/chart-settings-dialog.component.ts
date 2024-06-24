import { Component, OnInit, Inject, Injector, Output, EventEmitter } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';

@Component({
  selector: 'app-chart-settings-dialog',
  templateUrl: './chart-settings-dialog.component.html',
  styleUrls: ['./chart-settings-dialog.component.scss']
})
export class ChartSettingsDialogComponent implements OnInit {

  @Output() closeEvent = new EventEmitter();

  workspaceData;
  selectedManagerField;

  posibleManagerCF = [];

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
      public utilityService: UtilityService,
      private injector: Injector,
      private workspaceService: WorkspaceService,
      private mdDialogRef: MatDialogRef<ChartSettingsDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any,
    ) { }

  async ngOnInit(): Promise<void> {
    this.workspaceData = this.data.workspaceData;

    if (!this.workspaceData) {
      this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    }

    this.posibleManagerCF = (this.workspaceData?.profile_custom_fields) ? this.workspaceData?.profile_custom_fields?.filter(cf =>  cf.user_type) : [];
    this.selectedManagerField = this.workspaceData.manager_custom_field;
  }

  closeDialog() {
    this.mdDialogRef.close();
  }

  selectManagerField(cfSelected) {
    this.utilityService.asyncNotification($localize`:@@chartSettingsDialog.pleaseWaitsavingSettings:Please wait, we are saving the new setting...`,
    new Promise((resolve, reject)=>{
      this.workspaceService.saveSettings(this.workspaceData?._id, { manager_custom_field: cfSelected.value })
        .then(()=> {
          this.selectedManagerField = cfSelected.value;
          this.workspaceData.manager_custom_field = cfSelected.value;
          this.publicFunctions.sendUpdatesToWorkspaceData(this.workspaceData);
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@chartSettingsDialog.settingsSaved:Settings saved!`));
          this.mdDialogRef.close();
        })
        .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@chartSettingsDialog.unableToSaveGroupSettings:Unable to save the settings, please try again!`)));
    }));
  }
}
