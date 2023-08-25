import { Component, OnInit, Injector, OnDestroy, AfterContentChecked } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';
import { UserService } from 'src/shared/services/user-service/user.service';
import { HRService } from 'src/shared/services/hr-service/hr.service';
import moment from 'moment';

@Component({
  selector: 'app-user-hive',
  templateUrl: './user-hive.component.html',
  styleUrls: ['./user-hive.component.scss']
})
export class UserHiveComponent implements OnInit, AfterContentChecked, OnDestroy {

  // User Data Variable
  userData: any;

  // Workspace Data Variable
  workspaceData: any;

  // Is current user component
  isCurrentUser: boolean = false;

  hrCustomFields: any = [];
  selectedHRCFValues: any = [];

  hrVariables: any = [];
  selectedHRVariablesValues: any = [];

  hrBenefits: any = [];
  selectedHRBenefitsValues: any = [];

  isLoading$;

  // Public functions class member
  publicFunctions = new PublicFunctions(this.injector);

  // UNSUBSCRIBE THE DATA
  private subSink = new SubSink();

  constructor(
    private injector: Injector,
    public dialog: MatDialog,
    private utilityService: UtilityService,
    private hrService: HRService,
    private userService: UserService
  ) { }

  async ngOnInit() {

    // Setting Home State
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'user-account'
    });

    this.userData = await this.publicFunctions.getCurrentUser();
    // force to reload the userData because the previous line will take the data from storage, and may not have some changes
    this.userData = await this.publicFunctions.getOtherUser(this.userData?._id);
    this.isCurrentUser = true;
    if (!this.userData.hr) {
      this.userData.hr = {};
    }

    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    this.initPayrollProperties();
  }

  ngAfterContentChecked() {
    this.subSink.add(this.utilityService.isLoadingSpinner.subscribe((res) => {
      this.isLoading$ = res;
    }));
  }

  ngOnDestroy() {
    this.subSink.unsubscribe();
  }

  initPayrollProperties() {
    this.hrCustomFields = [];
    this.selectedHRCFValues = [];

    this.hrService.getEntityPayrollInfo(this.userData?._id).then((res) => {
      if (res['entity']) {

        if (!this.userData.hr) {
          this.userData.hr = {
            entity_custom_fields: new Map<string, string>(),
            entity_variables: new Map<string, string>()
          };
        }

        if (res['entity']['payroll_custom_fields']) {
          res['entity']['payroll_custom_fields'].forEach(async field => {

            if (!this.userData.hr.entity_custom_fields) {
              this.userData.hr.entity_custom_fields = new Map<string, string>();
            }

            if (!this.userData.hr.entity_custom_fields[field._id]) {
              this.userData.hr.entity_custom_fields[field.name] = '';
              this.selectedHRCFValues[field._id] = '';
            } else {
              this.selectedHRCFValues[field._id] = this.userData.hr.entity_custom_fields[field._id];
            }

            if (this.isCurrentUser || ['owner', 'admin', 'manager'].includes(this.userData?.role) || !field.hide_in_business_card) {
              this.hrCustomFields.push(field);
            }
          });
        }

        if (res['entity']['payroll_variables']) {
          res['entity']['payroll_variables'].forEach(async field => {
              if (!this.userData.hr.entity_variables) {
                this.userData.hr.entity_variables = new Map<string, string>();
              }

              if (!this.userData.hr.entity_variables[field._id]) {
                this.userData.hr.entity_variables[field._id] = '';
                this.selectedHRVariablesValues[field._id] = '';
              } else {
                this.selectedHRVariablesValues[field._id] = this.userData.hr.entity_variables[field._id];
              }

              if (this.isCurrentUser || ['owner', 'admin', 'manager'].includes(this.userData?.role)) {
                this.hrVariables.push(field);
              }
            });
        }

        if (res['entity']['payroll_benefits']) {
          res['entity']['payroll_benefits'].forEach(async field => {
              if (!this.userData.hr.entity_benefits) {
                this.userData.hr.entity_benefits = new Map<string, string>();
              }

              if (!this.userData.hr.entity_benefits[field._id]) {
                this.userData.hr.entity_benefits[field._id] = '';
                this.selectedHRBenefitsValues[field._id] = '';
              } else {
                if (field.type == 'Multiselect') {
                  this.selectedHRBenefitsValues[field._id] = this.userData.hr.entity_benefits[field._id].split(",");
                } else {
                  this.selectedHRBenefitsValues[field._id] = this.userData.hr.entity_benefits[field._id];
                }
              }

              if (this.isCurrentUser || ['owner', 'admin', 'manager'].includes(this.userData?.role)) {
                this.hrBenefits.push(field);
              }
            });
        }
      }
    });
  }

  changeCountry(value: any) {
    if (value) {
      this.saveHRProperty('country', value);
    }
  }

  saveHRProperty(property_name: string, value: any) {

    if (value != '') {
      this.userData.hr[property_name] = value;
      
      this.utilityService.asyncNotification($localize`:@@editEntityDialog.plesaeWaitWeAreUpdaing:Please wait we are updating the entity...`, new Promise((resolve, reject) => {
        this.userService.updateUser(this.userData)
          .then(async (res) => {
            this.publicFunctions.sendUpdatesToUserData(this.userData);

            // Resolve with success
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@editEntityDialog.entityUpdated:Entity updated!`));
          })
          .catch(() => {
            reject(this.utilityService.rejectAsyncPromise($localize`:@@editEntityDialog.unableToUpdateEntity:Unable to update the entity, please try again!`));
          });
      }));
    }
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
    this.utilityService.asyncNotification($localize`:@@userHive.pleaseWaitWeUpdateContents:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
      this.userService.savePayrollCustomField(this.userData._id, customFieldId, customFieldValue)
        .then(async (res) => {

          const field = this.hrCustomFields[this.hrCustomFields.findIndex(cf => cf.name == customFieldId)];
          if (field) {
            this.selectedHRCFValues[customFieldId] = customFieldValue;
            this.userData.hr.entity_custom_fields[customFieldId] = customFieldValue;
          }

          this.publicFunctions.sendUpdatesToUserData(this.userData);
          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@userHive.cfUpdated:Field updated!`));
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@userHive.unableToUpdateCF:Unable to update field, please try again!`));
        });
    }));
  }

  formateDate(date) {
    return (date) ? moment(moment.utc(date), "YYYY-MM-DD").toDate() : '';
  }
}
