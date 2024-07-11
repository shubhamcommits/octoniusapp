import { Component, OnInit, Inject, Output, EventEmitter, Injector } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { MatLegacyDialog as MatDialog, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { PublicFunctions } from 'modules/public.functions';
import { ColorPickerDialogComponent } from 'src/app/common/shared/color-picker-dialog/color-picker-dialog.component';

@Component({
  selector: 'app-custom-fields-dialog',
  templateUrl: './custom-fields-dialog.component.html',
  styleUrls: ['./custom-fields-dialog.component.scss']
})
export class CustomFieldsDialogComponent implements OnInit {

  @Output() customFieldsEvent = new EventEmitter();

  customFields = [];

  showNewCustomField = false;
  newCustomFieldTitle = '';
  newCustomFieldInputType = false;
  newCustomFieldInputSelectType = 'number';

  groupData;

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public utilityService: UtilityService,
    private groupService: GroupService,
    private injector: Injector,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog
  ) { }

  async ngOnInit() {
    this.groupData = this.data.groupData;

    await this.groupService.getGroupCustomFields(this.groupData._id).then((res) => {
      if (res['group']['custom_fields']) {
        res['group']['custom_fields'].forEach(async field => {
          await this.sortValues(field);
          this.customFields.push(field);
        });
      }
    });

    this.customFields.sort((cf1, cf2) => (cf1.title > cf2.title) ? 1 : -1);
  }

  sortValues(field) {
    if (!field.input_type) {
      field.values.sort((v1, v2) => (v1 > v2) ? 1 : -1);
    }
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
        this.utilityService.warningNotification($localize`:@@customFieldDialog.fieldAlreadyExist:Field already exist!`);
      } else {
        const newCF = {
          name: this.newCustomFieldTitle.toLowerCase(),
          title: this.titleCase(this.newCustomFieldTitle),
          input_type: this.newCustomFieldInputType,
          input_type_number: (this.newCustomFieldInputType && this.newCustomFieldInputSelectType == 'number') ? true : false,
          input_type_text: (this.newCustomFieldInputType && this.newCustomFieldInputSelectType == 'text') ? true : false,
          input_type_date: (this.newCustomFieldInputType && this.newCustomFieldInputSelectType == 'date') ? true : false,
          values: []
        };


        // Save the new field
        await this.groupService.saveNewCustomField(newCF, this.groupData._id).then((res) => {
          const dbCustomFields = res['group']['custom_fields']
          const index = dbCustomFields.findIndex((f: any) => f.name.toLowerCase() === newCF.name);
          if (index >= 0) {
            newCF['_id'] = dbCustomFields[index]._id;
          }
          this.groupData.custom_fields = res['group'].custom_fields;
          this.publicFunctions.sendUpdatesToGroupData(this.groupData);
        });

        this.customFields.push(newCF);

        this.showNewCustomField = false;
        this.newCustomFieldTitle = '';
        this.newCustomFieldInputType = false;
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
          this.utilityService.asyncNotification($localize`:@@customFieldDialog.pleaseWaitDeletingCF:Please wait we are deleting the custom field...`, new Promise((resolve, reject) => {
            const index = this.customFields.findIndex((f: any) => f.name.toLowerCase() === field.name.toLowerCase());
            if (index !== -1) {
              // Remove the value
              this.groupService.removeCustomField(field._id, this.groupData._id)
                .then((res) => {
                  // Remove the field from the list
                  this.customFields.splice(index, 1);

                  this.groupData.custom_fields = res['group'].custom_fields;
                  this.groupData.custom_fields_table_widget.selectTypeCFs = res['group'].custom_fields_table_widget.selectTypeCFs;
                  this.groupData.custom_fields_table_widget.inputTypeCFs = res['group'].custom_fields_table_widget.inputTypeCFs;
                  this.publicFunctions.sendUpdatesToGroupData(this.groupData);

                  resolve(this.utilityService.resolveAsyncPromise($localize`:@@customFieldDialog.fieldDeleted:Field deleted!`));
                }).catch((err) => {
                  reject(this.utilityService.rejectAsyncPromise($localize`:@@customFieldDialog.unableToDeleteField:Unable to delete field, please try again!`));
                });
            }
          }));
        }
      });
  }

  async addValue(field, event: Event) {
    const newValue = event.target['value'];

    if (newValue !== '') {
      // Find the index of the field to check if the same named field exist or not
      const index = field.values.findIndex((v: string) => v.toLowerCase() === newValue.toLowerCase());

      // If index is found, then throw error notification
      if (index !== -1) {
        this.utilityService.warningNotification($localize`:@@customFieldDialog.valueAlreadyExists:Value already exists!`);
      } else {
        field.values.push(newValue);
        await this.sortValues(field);

        // Save the new value
        this.groupService.addCustomFieldNewValue(newValue, field._id, this.groupData._id).then(res => {
          this.groupData.custom_fields = res['group'].custom_fields;
          this.publicFunctions.sendUpdatesToGroupData(this.groupData);
        });

        event.target['value'] = '';
      }
    }
  }

  setDisplayInKanbanCard(field) {
    this.utilityService.asyncNotification($localize`:@@customFieldDialog.pleaseWaitUpdatingCF:Please wait we are updating the custom field...`, new Promise((resolve, reject) => {
      this.groupService.setCustomFieldDisplayKanbanCard(!field.display_in_kanban_card, field._id, this.groupData._id).then(res => {
        this.groupData.custom_fields = res['group'].custom_fields;
        this.publicFunctions.sendUpdatesToGroupData(this.groupData);

        resolve(this.utilityService.resolveAsyncPromise($localize`:@@customFieldDialog.fieldUpdated:Field updated!`));
      }).catch((err) => {
        reject(this.utilityService.rejectAsyncPromise($localize`:@@customFieldDialog.unableToUpdateField:Unable to update field, please try again!`));
      });
    }));
  }

  removeValue(field, value: string) {
    const index = field.values.findIndex((v: string) => v.toLowerCase() === value.toLowerCase());

    if (index !== -1) {
      // Remove the value
      this.groupService.removeCustomFieldValue(value, field._id, this.groupData._id)
        .then((res) => {
          field.values.splice(index, 1);

          this.groupData.custom_fields = res['group'].custom_fields;
          this.publicFunctions.sendUpdatesToGroupData(this.groupData);
        });
    }
  }

  titleCase(word: string) {
    if (!word) {
      return word;
    }
    return word[0].toUpperCase() + word.substr(1).toLowerCase();
  }

  /**
   * This function opens up the dialog to select a color
   */
  openColorPicker(field: any) {
    const dialogRef = this.dialog.open(ColorPickerDialogComponent, {
      width: '67%',
      height: '50%',
      disableClose: false,
      hasBackdrop: true,
      data: { colorSelected: field.badge_color }
    });

    const colorPickedSubs = dialogRef.componentInstance.colorPickedEvent.subscribe(async (data) => {
      const index = this.customFields.findIndex((cf: any) => cf.name == field.name);

      this.utilityService.asyncNotification($localize`:@@customFieldDialog.pleaseWaitUpdatingCF:Please wait we are updating the custom field...`, new Promise((resolve, reject) => {
        this.groupService.setCustomFieldColor(data, field._id, this.groupData._id).then(res => {

          this.customFields[index].badge_color = data;
          this.groupData.custom_fields = res['group'].custom_fields;

          this.publicFunctions.sendUpdatesToGroupData(this.groupData);

          resolve(this.utilityService.resolveAsyncPromise($localize`:@@customFieldDialog.fieldUpdated:Field updated!`));
        }).catch((err) => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@customFieldDialog.unableToUpdateField:Unable to update field, please try again!`));
        });
      }));
    });

    dialogRef.afterClosed().subscribe(result => {
      colorPickedSubs.unsubscribe();
    });
  }

  removeBadgeColor(field: any) {
    const index = this.customFields.findIndex((cf: any) => cf.name == field.name);

    this.utilityService.asyncNotification($localize`:@@customFieldDialog.pleaseWaitUpdatingCF:Please wait we are updating the custom field...`, new Promise((resolve, reject) => {
      this.groupService.setCustomFieldColor('', field._id, this.groupData._id).then(res => {
        this.groupData.custom_fields = res['group'].custom_fields;

        this.customFields[index].badge_color = '';
        this.publicFunctions.sendUpdatesToGroupData(this.groupData);

        resolve(this.utilityService.resolveAsyncPromise($localize`:@@customFieldDialog.fieldUpdated:Field updated!`));
      }).catch((err) => {
        reject(this.utilityService.rejectAsyncPromise($localize`:@@customFieldDialog.unableToUpdateField:Unable to update field, please try again!`));
      });
    }));
  }

  selectInputType(value: string) {
    this.newCustomFieldInputSelectType = value;
  }
}
