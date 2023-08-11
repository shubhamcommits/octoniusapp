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
  
  hrBenefits: any = [];
  selectedHRBenefitValues: any = [];

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
    this.hrService.getEntityPayrollInfo(this.memberId).then((res) => {
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

        if (res['entity']['payroll_benefits']) {
          res['entity']['payroll_benefits'].forEach(async field => {

            if (!this.memberData.hr.entity_benefits) {
              this.memberData.hr.entity_benefits = new Map<string, string>();
            }

            if (!this.memberData.hr.entity_benefits[field._id]) {
              this.memberData.hr.entity_benefits[field._id] = '';
              this.selectedHRBenefitValues[field._id] = '';
            } else {

              if (field.type == 'Multiselect') {
                this.selectedHRBenefitValues[field._id] = this.memberData.hr.entity_benefits[field._id].split(",");
              } else {
                this.selectedHRBenefitValues[field._id] = this.memberData.hr.entity_benefits[field._id];
              }
            }

            this.hrBenefits.push(field);
          });
        }
      }
    });
  }

  /**
   * CF STARTS
   */
  onSelectEntityCustomFieldChange(event: any, customFieldId: string) {
    const customFieldValue = event.value;
    this.savePayrollCustomField(customFieldId, customFieldValue);
  }

  onInputEntityCustomFieldChange(event: Event, cfId: string) {
    const value = event.target['value'];
    this.savePayrollCustomField(cfId, value);
  }

  onDateEntityCustomFieldChange(dateObject: any, cfId: string) {
    this.savePayrollCustomField(cfId, dateObject.toDate());
  }

  savePayrollCustomField(customFieldId: string, customFieldValue: any) {
    this.utilityService.asyncNotification($localize`:@@editMemberPayrollDialog.pleaseWaitWeUpdateContents:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
      this.userService.savePayrollCustomField(this.memberData._id, customFieldId, customFieldValue)
        .then(async (res) => {

          const field = this.hrCustomFields[this.hrCustomFields.findIndex(cf => cf._id == customFieldId)];
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
  /**
   * CF ENDS
   */
  
  /**
   * VARIABLES STARTS
   */
  onInputEntityVariableChange(event: Event, variableId: string) {
    const value = event.target['value'];
    this.savePayrollVariable(variableId, value);
  }

  savePayrollVariable(variableId: string, variableValue: any) {
    this.utilityService.asyncNotification($localize`:@@editMemberPayrollDialog.pleaseWaitWeUpdateContents:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
      this.userService.savePayrollVariable(this.memberData?._id, variableId, variableValue)
        .then(async (res) => {

          const field = this.hrVariables[this.hrVariables.findIndex(variabled => variabled._id == variableId)];
          if (field && !field.user_type) {
            this.selectedHRVariablesValues[variableId] = variableValue;
            this.memberData.hr.entity_variables[variableId] = variableValue;
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
  /**
   * VARIABLES ENDS
   */

  /**
   * BENEFITS STARTS
   */
  onSelectEntityBenefitChange(event: any, benefitId: string) {
    const benefitValue = event.value;
    this.savePayrollBenefit(benefitId, benefitValue);
  }

  onInputEntityBenefitChange(event: Event, benefitId: string) {
    const value = event.target['value'];
    this.savePayrollBenefit(benefitId, value);
  }

  onDateEntityBenefitChange(dateObject: any, benefitId: string) {
    this.savePayrollBenefit(benefitId, dateObject.toDate());
  }

  savePayrollBenefit(benefitId: string, benefitValue: any) {
    this.utilityService.asyncNotification($localize`:@@editMemberPayrollDialog.pleaseWaitWeUpdateContents:Please wait we are updating the contents...`, new Promise((resolve, reject) => {

      const field = this.hrBenefits[this.hrBenefits.findIndex(benefit => benefit._id == benefitId)];
      let value = (field && field.type == 'Multiselect') ? benefitValue.toString() : benefitValue;

      this.userService.savePayrollBenefit(this.memberData._id, benefitId, value)
        .then(async (res) => {

          if (field) {
            this.selectedHRBenefitValues[benefitId] = benefitValue;
            this.memberData.hr.entity_benefits[benefitId] = benefitValue;
          }

          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@editMemberPayrollDialog.benefitUpdated:Benefit updated!`));
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@editMemberPayrollDialog.unableToUpdateBenefit:Unable to update benefit, please try again!`));
        });
    }));
  }
  /**
   * BENEFITS ENDS
   */

  closeDialog() {
    // Close the modal
    this.mdDialogRef.close();
  }

  formateDate(date) {
    return (date) ? moment(moment.utc(date), "YYYY-MM-DD").toDate() : '';
  }
}
