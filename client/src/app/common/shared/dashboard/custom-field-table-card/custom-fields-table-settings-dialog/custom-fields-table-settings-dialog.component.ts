import { Component, EventEmitter, Inject, Injector, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-custom-fields-table-settings-dialog',
  templateUrl: './custom-fields-table-settings-dialog.component.html',
  styleUrls: ['./custom-fields-table-settings-dialog.component.scss']
})
export class CustomFieldsTableSettingsDialogComponent implements OnInit {

  @Output() saveEvent = new EventEmitter();

  groupId;
  customFields = [];
  selectTypeCFs = [];
  inputTypeCFs = [];


  selectCustomFields = [];
  inputCustomFields = [];

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private groupService: GroupService,
    public utilityService: UtilityService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private mdDialogRef: MatDialogRef<CustomFieldsTableSettingsDialogComponent>,
    private injector: Injector
  ) {
    this.groupId = this.data.groupId;
    this.customFields = this.data.customFields;
    this.selectTypeCFs = this.data.selectTypeCFs;
    this.inputTypeCFs = this.data.inputTypeCFs;

    this.customFields.forEach(cf => {
      if (cf.input_type) {
        if (cf.input_type_number) {
          this.inputCustomFields.push(cf);
        } else {
          this.selectCustomFields.push(cf);
        }
      } else {
        if (cf.name != 'priority') {
          this.selectCustomFields.push(cf);
        }
      }
    });
  }

  async ngOnInit() {

  }

  selectSelectTypeCF(cf: any, active: boolean) {
    if (active) {
      if (!this.selectTypeCFs) {
        this.selectTypeCFs = []
      }
      this.selectTypeCFs.push(cf.name);
    } else {
      const index = (this.selectTypeCFs) ? this.selectTypeCFs.findIndex(field => field == cf.name) : -1;
      if (index >= 0) {
        this.selectTypeCFs.splice(index, 1);
      }
    }
  }

  isSelectTypeChecked(cfName: string) {
    return this.selectTypeCFs && this.selectTypeCFs.findIndex(field => field == cfName) >= 0;
  }

  isChecked(cfName: string) {
    return this.inputTypeCFs && this.inputTypeCFs.findIndex(field => field == cfName) >= 0;
  }

  selectInputTypeCF(cf: any, active: boolean) {
    if (active) {
      this.inputTypeCFs.push(cf.name);
    } else {
      const index = this.inputTypeCFs.findIndex(field => field == cf.name);
      this.inputTypeCFs.splice(index, 1);
    }
  }

  save() {
    const settings = { selectTypeCFs: this.selectTypeCFs, inputTypeCFs: this.inputTypeCFs };

    this.utilityService.asyncNotification($localize`:@@cfTableSettingsDialog.pleaseWaitWeSavingWidgets:Please wait we are saving the settings...`, new Promise((resolve, reject) => {
      this.groupService.saveCFTableWidgetSettings(this.groupId, settings)
        .then((res) => {
          this.publicFunctions.sendUpdatesToGroupData(res['group']);

          // Close the modal
          this.mdDialogRef.close();

          resolve(this.utilityService.resolveAsyncPromise($localize`:@@cfTableSettingsDialog.groupUpdated:Group updated!`));
        })
        .catch((err) => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@cfTableSettingsDialog.unableToUpdateGroup:Unable to update the group, please try again!`))
        });
    }));

    this.saveEvent.emit(settings);

    // Close the modal
    this.mdDialogRef.close();
  }

  cancel() {
    // Close the modal
    this.mdDialogRef.close();
  }
}
