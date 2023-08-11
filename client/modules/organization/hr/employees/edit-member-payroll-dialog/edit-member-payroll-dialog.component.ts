import { Component, EventEmitter, Inject, Injector, Input, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment';
import { HRService } from 'src/shared/services/hr-service/hr.service';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-edit-member-payroll-dialog',
  templateUrl: './edit-member-payroll-dialog.component.html',
  styleUrls: ['./edit-member-payroll-dialog.component.scss']
})
export class EditMemberPayrollDialogComponent implements OnInit {

  @Output() memberEditedEvent = new EventEmitter();

  entityId;

  memberId;
  memberData: any;
  
  hrCustomFields: any = [];
  selectedHRCFValues: any = [];

  hrVariables: any = [];
  selectedHRVariablesValues: any = [];

  // Public functions class member
  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private hrService: HRService,
    private utilityService: UtilityService,
    private userService: UserService,
    private injector: Injector,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private mdDialogRef: MatDialogRef<EditMemberPayrollDialogComponent>
  ) {
    this.memberId = this.data.memberId;
  }

  async ngOnInit() {
    this.memberData = await this.publicFunctions.getOtherUser(this.memberId);
    if (this.memberData) {
      this.initPayrollProperties();
    }
  }

  initPayrollProperties() {
    this.hrService.getEntityPayrollVariablesAndCustomFields(this.memberId).then((res) => {
      if (res['entity']) {
        if (!this.memberData.hr) {
          this.memberData.hr = {
            entity_custom_fields: new Map<string, string>(),
            entity_variables: new Map<string, string>()
          };
        }

        if (res['entity']['payroll_custom_fields']) {
          res['entity']['payroll_custom_fields'].forEach(async field => {

            if (!this.memberData.hr.entity_custom_fields) {
              this.memberData.hr.entity_custom_fields = new Map<string, string>();
            }

            if (!this.memberData.hr.entity_custom_fields[field._id]) {
              this.memberData.hr.entity_custom_fields[field._id] = '';
              this.selectedHRCFValues[field._id] = '';
            } else {
              this.selectedHRCFValues[field._id] = this.memberData.hr.entity_custom_fields[field._id];
            }

            this.hrCustomFields.push(field);
          });
        }

        if (res['entity']['payroll_variables']) {
          res['entity']['payroll_variables'].forEach(async field => {
              if (!this.memberData.hr.entity_variables) {
                this.memberData.hr.entity_variables = new Map<string, string>();
              }

              if (!this.memberData.hr.entity_variables[field._id]) {
                this.memberData.hr.entity_variables[field._id] = '';
                this.selectedHRVariablesValues[field._id] = '';
              } else {
                this.selectedHRVariablesValues[field._id] = this.memberData.hr.entity_variables[field._id];
              }

              this.hrVariables.push(field);
            });
        }
      }
    });
  }

  onSelectEntityCustomFieldChange(event: any, customFieldId: string) {
    const customFieldValue = event.value;
    this.savePayrollCustomField(customFieldId, customFieldValue);
  }

  onInputEntityCustomFieldChange(event: Event, variabledId: string) {
    const value = event.target['value'];
    this.savePayrollCustomField(variabledId, value);
  }

  onDateEntityCustomFieldChange(dateObject: any, cfId: string) {
    this.savePayrollCustomField(cfId, dateObject.toDate());
  }

  savePayrollCustomField(customFieldId: string, customFieldValue: any) {
    this.utilityService.asyncNotification($localize`:@@editMemberPayrollDialog.pleaseWaitWeUpdateContents:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
      this.userService.savePayrollCustomField(this.memberData._id, customFieldId, customFieldValue)
        .then(async (res) => {

          const field = this.hrCustomFields[this.hrCustomFields.findIndex(cf => cf.name == customFieldId)];
          if (field) {
            this.selectedHRCFValues[customFieldId] = customFieldValue;
            this.memberData.hr.entity_custom_fields[customFieldId] = customFieldValue;
          }

          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@editMemberPayrollDialog.cfUpdated:Field updated!`));
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@editMemberPayrollDialog.unableToUpdateCF:Unable to update field, please try again!`));
        });
    }));
  }

  onInputEntityVariableChange(event: Event, variabledId: string) {
    const value = event.target['value'];
    this.savePayrollVariable(variabledId, value);
  }

  savePayrollVariable(variabledId: string, variableValue: any) {
    this.utilityService.asyncNotification($localize`:@@editMemberPayrollDialog.pleaseWaitWeUpdateContents:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
      this.userService.savePayrollVariable(this.memberData?._id, variabledId, variableValue)
        .then(async (res) => {

          const field = this.hrVariables[this.hrVariables.findIndex(variabled => variabled.name == variabledId)];
          if (field && !field.user_type) {
            this.selectedHRVariablesValues[variabledId] = variableValue;
            this.memberData.hr.entity_variables[variabledId] = variableValue;
          }

          this.memberEditedEvent.emit(this.memberData);
          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@editMemberPayrollDialog.cfUpdated:Field updated!`));
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@editMemberPayrollDialog.unableToUpdateCF:Unable to update field, please try again!`));
        });
    }));
  }

  closeDialog() {
    // Close the modal
    this.mdDialogRef.close();
  }

  formateDate(date) {
    return (date) ? moment(moment.utc(date), "YYYY-MM-DD").toDate() : '';
  }
}
