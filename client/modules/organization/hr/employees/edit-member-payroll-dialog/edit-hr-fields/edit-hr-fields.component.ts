import { Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { DatesService } from 'src/shared/services/dates-service/dates.service';
import { HRService } from 'src/shared/services/hr-service/hr.service';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-edit-hr-fields',
  templateUrl: './edit-hr-fields.component.html',
  styleUrls: ['./edit-hr-fields.component.scss']
})
export class EditHRFieldsComponent implements OnInit {

  @Input() memberId;

  @Output() memberEditedEvent = new EventEmitter();

  entityId;

  memberData: any;
  
  hrCustomFields: any = [];
  selectedHRCFValues: any = [];

  hrVariables: any = [];
  selectedHRVariablesValues: any = [];
  
  hrBenefits: any = [];
  selectedHRBenefitValues: any = [];

  joinDate;

  showError = false;
  errorMessage = '';

  // Public functions class member
  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public utilityService: UtilityService,
    private hrService: HRService,
    private datesService: DatesService,
    private userService: UserService,
    private injector: Injector
  ) {
  }

  async ngOnInit() {
    this.memberData = await this.publicFunctions.getOtherUser(this.memberId);
    if (this.memberData) {
      this.joinDate = this.datesService.formateDate(this.memberData?.company_join_date);

      this.initPayrollProperties();

      if (!this.memberData.hr) {
        this.memberData.hr = {};
      }

      if (!this.memberData.hr.entity_extra_days_off) {
        this.memberData.hr.entity_extra_days_off = {
          holidays: 0,
          sick: 0,
          personal_days: 0
        };
      }
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

            if (!this.hrCustomFields) {
              this.hrCustomFields = []
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

              if (!this.hrVariables) {
                this.hrVariables = []
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

            if (!this.hrBenefits) {
              this.hrBenefits = []
            }
            this.hrBenefits.push(field);
          });
        }
      } else {
        this.showError = true;
        this.errorMessage = res['message'];
      }
    });
  }

  changeCountry(value: any) {
    if (value) {
      this.saveProperty({'hr.country': value});
    }
  }

  // saveHRProperty(property_name: string, value: any) {

  //   if (value != '') {
  //     this.memberData.hr[property_name] = value;
      
  //     this.utilityService.asyncNotification($localize`:@@editHRFields.plesaeWaitWeAreUpdaing:Please wait we are updating the entity...`, new Promise((resolve, reject) => {
  //       this.userService.updateUser(this.memberData)
  //         .then(async (res) => {
  //           // Resolve with success
  //           resolve(this.utilityService.resolveAsyncPromise($localize`:@@editHRFields.entityUpdated:Entity updated!`));
  //         })
  //         .catch(() => {
  //           reject(this.utilityService.rejectAsyncPromise($localize`:@@editHRFields.unableToUpdateEntity:Unable to update the entity, please try again!`));
  //         });
  //     }));
  //   }
  // }

  saveJoinDate(valueToSave: any) {
    this.memberData.company_join_date = valueToSave.toISODate();
    this.saveProperty({ 'company_join_date': valueToSave });
  }

  saveProperty(propertyToSave: any) {
    this.utilityService.asyncNotification($localize`:@@editHRFields.pleaseWaitWeUpdateContents:Please wait we are updating the contents...`, new Promise((resolve, reject) => {

      this.userService.updateUserProperty(this.memberData._id, propertyToSave)
        .then(async (res) => {
          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@editHRFields.updated:User HR field updated!`));
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@editHRFields.unableToUpdate:Unable to update HR field, please try again!`));
        });
    }));
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
    this.savePayrollCustomField(cfId, dateObject.toISODate());
  }

  savePayrollCustomField(customFieldId: string, customFieldValue: any) {
    this.utilityService.asyncNotification($localize`:@@editHRFields.pleaseWaitWeUpdateContents:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
      this.userService.savePayrollCustomField(this.memberData._id, customFieldId, customFieldValue)
        .then(async (res) => {

          const field = this.hrCustomFields[this.hrCustomFields.findIndex(cf => cf._id == customFieldId)];
          if (field) {
            this.selectedHRCFValues[customFieldId] = customFieldValue;
            this.memberData.hr.entity_custom_fields[customFieldId] = customFieldValue;
          }

          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@editHRFields.cfUpdated:Field updated!`));
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@editHRFields.unableToUpdateCF:Unable to update field, please try again!`));
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
    this.utilityService.asyncNotification($localize`:@@editHRFields.pleaseWaitWeUpdateContents:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
      this.userService.savePayrollVariable(this.memberData?._id, variableId, variableValue)
        .then(async (res) => {

          const field = this.hrVariables[this.hrVariables.findIndex(variabled => variabled._id == variableId)];
          if (field && !field.user_type) {
            this.selectedHRVariablesValues[variableId] = variableValue;
            this.memberData.hr.entity_variables[variableId] = variableValue;
          }
          
          this.memberEditedEvent.emit(this.memberData);
          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@editHRFields.cfUpdated:Field updated!`));
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@editHRFields.unableToUpdateCF:Unable to update field, please try again!`));
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
    this.savePayrollBenefit(benefitId, event.value);
  }

  onCheckedEntityBenefitChange(benefitValues: any, benefitSelectedValue: string, benefitId: string) {
    const index = (benefitValues) ? benefitValues.findIndex(b => b == benefitSelectedValue) : -1;
    if (!benefitValues) {
      benefitValues = [];
    }
    if (index < 0) {
      benefitValues.push(benefitSelectedValue);
    }

    this.savePayrollBenefit(benefitId, benefitValues);
  }

  isSelected(benefitValues, benefitSelected) {
    return (benefitValues) ? benefitValues.findIndex(b => b == benefitSelected) >= 0 : false;
  }

  onInputEntityBenefitChange(event: Event, benefitId: string) {
    const value = event.target['value'];
    this.savePayrollBenefit(benefitId, value);
  }

  onDateEntityBenefitChange(dateObject: any, benefitId: string) {
    this.savePayrollBenefit(benefitId, dateObject.toISODate());
  }

  savePayrollBenefit(benefitId: string, benefitValue: any) {
    this.utilityService.asyncNotification($localize`:@@editHRFields.pleaseWaitWeUpdateContents:Please wait we are updating the contents...`, new Promise((resolve, reject) => {

      const field = this.hrBenefits[this.hrBenefits.findIndex(benefit => benefit._id == benefitId)];
      let value = (field && field.type == 'Multiselect') ? benefitValue.toString() : benefitValue;

      this.userService.savePayrollBenefit(this.memberData._id, benefitId, value)
        .then(async (res) => {

          if (field) {
            this.selectedHRBenefitValues[benefitId] = benefitValue;
            this.memberData.hr.entity_benefits[benefitId] = benefitValue;
          }

          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@editHRFields.benefitUpdated:Benefit updated!`));
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@editHRFields.unableToUpdateBenefit:Unable to update benefit, please try again!`));
        });
    }));
  }
  /**
   * BENEFITS ENDS
   */

  /**
   * HOLIDAYS STARTS
   */
  onDaysOffChange(propertyToSave: any) {
    this.utilityService.asyncNotification($localize`:@@editHRFields.pleaseWaitWeUpdateContents:Please wait we are updating the contents...`, new Promise((resolve, reject) => {

      this.userService.savePayrollExtraDaysOff(this.memberData._id, propertyToSave)
        .then(async (res) => {

          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@editHRFields.daysOffUpdated:Days Off updated!`));
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@editHRFields.unableToUpdateDaysOff:Unable to update Days Off, please try again!`));
        });
    }));
  }
  /**
   * HOLIDAYS ENDS
   */

  formateDate(date) {
    return this.datesService.formateDate(date);
  }
}
