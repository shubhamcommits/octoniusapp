import { Component, OnInit, Inject, Injector, Output, EventEmitter } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { PublicFunctions } from 'modules/public.functions';
import { GroupService } from 'src/shared/services/group-service/group.service';

@Component({
    selector: 'app-files-settings-dialog',
    templateUrl: './files-settings-dialog.component.html',
    styleUrls: ['./files-settings-dialog.component.scss']
  })
  export class FilesSettingsDialogComponent implements OnInit {

    @Output() closeEvent = new EventEmitter();

    groupData;

    // PUBLIC FUNCTIONS
    public publicFunctions = new PublicFunctions(this.injector);

    constructor(
        private injector: Injector,
        private utilityService: UtilityService,
        private groupService: GroupService,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private mdDialogRef: MatDialogRef<FilesSettingsDialogComponent>
        ) { }

    async ngOnInit(): Promise<void> {
      this.groupData = this.data.groupData;
    }

    onCloseDialog() {
      this.closeEvent.emit(this.groupData);
    }

    saveSettings(selected) {

      // Save the settings
      this.utilityService.asyncNotification($localize`:@@filesSettingsDialog.pleaseWaitsavingSettings:Please wait we are saving the new setting...`,
        new Promise((resolve, reject) => {
          if (selected.source.name === 'files_for_admins') {
            this.groupService.saveSettings(this.groupData?._id, {files_for_admins: selected.checked})
              .then(()=> {
                this.publicFunctions.sendUpdatesToGroupData(this.groupData);

                resolve(this.utilityService.resolveAsyncPromise($localize`:@@filesSettingsDialog.settingsSaved:Settings saved to your group!`));
              })
              .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@filesSettingsDialog.unableToSaveGroupSettings:Unable to save the settings to your group, please try again!`)))
          }
        }));
  }
}
