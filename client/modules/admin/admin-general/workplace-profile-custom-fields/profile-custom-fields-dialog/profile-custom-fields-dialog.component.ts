import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';

@Component({
  selector: 'app-profile-custom-fields-dialog',
  templateUrl: './profile-custom-fields-dialog.component.html',
  styleUrls: ['./profile-custom-fields-dialog.component.scss']
})
export class ProfileCustomFieldsDialogComponent implements OnInit {

  customFields = [];

  showNewCustomField = false;
  newCustomFieldTitle = '';

  workspaceData;

  @Output() customFieldsEvent = new EventEmitter();

  constructor(
    public utilityService: UtilityService,
    private workspaceService: WorkspaceService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  async ngOnInit() {
    this.workspaceData = this.data.workspaceData;

    await this.workspaceService.getProfileCustomFields(this.workspaceData._id).then((res) => {
      res['workspace']['profile_custom_fields']?.forEach(field => {
        this.customFields.push(field);
      });
    });

    this.customFields.sort((cf1, cf2) => (cf1.title > cf2.title) ? 1 : -1);
  }

  onCloseDialog() {
    this.customFieldsEvent.emit(this.customFields);
  }

  async createCustomField() {
    if (this.newCustomFieldTitle !== '') {
      // Find the index of the field to check if the same named field exist or not
      const index = this.customFields.findIndex((f: any) => f.name.toLowerCase() === this.newCustomFieldTitle.toLowerCase());

      // If index is found, then throw error notification
      if (index !== -1) {
        this.utilityService.warningNotification($localize`:@@profileCustomFieldsDialog.fieldAlreadyExist:Field already exist!`);
      } else {
        const newCF = {
          name: this.newCustomFieldTitle.toLowerCase(),
          title: this.titleCase(this.newCustomFieldTitle),
          values: []
        };


        // Save the new field
        await this.workspaceService.saveNewCustomField(newCF, this.workspaceData._id).then((res) => {
          const dbCustomFields = res['workspace']['profile_custom_fields']
          const index = dbCustomFields.findIndex((f: any) => f.name.toLowerCase() === newCF.name);
          if (index >= 0) {
            newCF['_id'] = dbCustomFields[index]._id;
          }
        });

        this.customFields.push(newCF);

        this.showNewCustomField = false;
        this.newCustomFieldTitle = '';
      }
    }
  }

  /**
   * Call function to delete a custom field
   * @param field
   */
  removeCustomField(field) {

    // Ask User to remove this field or not
    this.utilityService.getConfirmDialogAlert()
      .then((result) => {
        if (result.value) {
          // Remove the file
          this.utilityService.asyncNotification($localize`:@@profileCustomFieldsDialog.pleaseWaitDeletingCF:Please wait we are deleting the custom field...`, new Promise((resolve, reject) => {
            const index = this.customFields.findIndex((f: any) => f.name.toLowerCase() === field.name.toLowerCase());
            if (index !== -1) {
              // Remove the value
              this.workspaceService.removeCustomField(field._id, this.workspaceData._id)
                .then((res) => {
                  // Remove the field from the list
                  this.customFields.splice(index, 1);

                  resolve(this.utilityService.resolveAsyncPromise($localize`:@@profileCustomFieldsDialog.cFDeleted:Field deleted!`));
                }).catch((err) => {
                  reject(this.utilityService.rejectAsyncPromise($localize`:@@profileCustomFieldsDialog.unableDeleteCF:Unable to delete field, please try again!`));
                });
            }
          }));
        }
      });
  }

  addValue(field, event: Event) {
    const newValue = event.target['value'];

    if (newValue !== '') {
      // Find the index of the field to check if the same named field exist or not
      const index = field.values.findIndex((v: string) => v.toLowerCase() === newValue.toLowerCase());

      // If index is found, then throw error notification
      if (index !== -1) {
        this.utilityService.warningNotification($localize`:@@profileCustomFieldsDialog.valueAlreadyExist:Value already exist!`);
      } else {
        field.values.push(newValue);

        // Save the new value
        this.workspaceService.addCustomFieldNewValue(newValue, field._id, this.workspaceData._id);

        event.target['value'] = '';
      }
    }
  }

  removeValue(field, value: string) {
    const index = field.values.findIndex((v: string) => v.toLowerCase() === value.toLowerCase());

    if (index !== -1) {
      // Remove the value
      this.workspaceService.removeCustomFieldValue(value, field._id, this.workspaceData._id)
        .then((res) => {
          field.values.splice(index, 1);
        });
    }
  }

  titleCase(word: string) {
    if (!word) {
      return word;
    }
    return word[0].toUpperCase() + word.substr(1).toLowerCase();
  }
}
