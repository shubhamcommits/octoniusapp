import { Component, OnInit, Injector, OnDestroy, AfterContentChecked } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';
import { UserService } from 'src/shared/services/user-service/user.service';
import { GroupsService } from 'src/shared/services/groups-service/groups.service';
import { GroupService } from 'src/shared/services/group-service/group.service';
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
    this.isCurrentUser = true;

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

    this.hrService.getEntityPayrollVariablesAndCustomFields(this.userData?._id).then((res) => {
      if (res['entity']) {

        if (!this.userData.hr) {
          this.userData.hr = {
            entity_custom_fields: new Map<string, string>(),
            payroll_variables: new Map<string, string>()
          };
        }

        if (res['entity']['payroll_custom_fields']) {
          res['entity']['payroll_custom_fields'].forEach(async field => {

            if (!this.userData.hr.entity_custom_fields) {
              this.userData.hr.entity_custom_fields = new Map<string, string>();
            }

            if (!this.userData.hr.entity_custom_fields[field.name]) {
              this.userData.hr.entity_custom_fields[field.name] = '';
              this.selectedHRCFValues[field.name] = '';
            } else {
              if (!field.user_type) {
                this.selectedHRCFValues[field.name] = this.userData.hr.entity_custom_fields[field.name];
              } else {
                this.selectedHRCFValues[field.name] = await this.publicFunctions.getOtherUser(this.userData.hr.entity_custom_fields[field.name]);
              }
            }

            const ldapFieldValue = this.selectedHRCFValues[field.name];
            if (ldapFieldValue && field.values.findIndex(value => value == ldapFieldValue) < 0) {
              field.values.push(ldapFieldValue);
            }

            if (this.isCurrentUser || ['owner', 'admin', 'manager'].includes(this.userData?.role) || !field.hide_in_business_card) {
              this.hrCustomFields.push(field);
            }
          });
        }

        if (res['entity']['payroll_variables']) {
          res['entity']['payroll_variables'].forEach(async field => {
              if (!this.userData.hr.entity_custom_fields) {
                this.userData.hr.entity_custom_fields = new Map<string, string>();
              }

              if (!this.userData.hr.entity_custom_fields[field.name]) {
                this.userData.hr.entity_custom_fields[field.name] = '';
                this.selectedHRVariablesValues[field.name] = '';
              } else {
                if (!field.user_type) {
                  this.selectedHRVariablesValues[field.name] = this.userData.hr.entity_custom_fields[field.name];
                } else {
                  this.selectedHRVariablesValues[field.name] = await this.publicFunctions.getOtherUser(this.userData.hr.entity_custom_fields[field.name]);
                }
              }

              const ldapFieldValue = this.selectedHRVariablesValues[field.name];
              if (ldapFieldValue && field.values.findIndex(value => value == ldapFieldValue) < 0) {
                field.values.push(ldapFieldValue);
              }

              if (this.isCurrentUser || ['owner', 'admin', 'manager'].includes(this.userData?.role) || !field.hide_in_business_card) {
                this.hrVariables.push(field);
              }
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
    this.utilityService.asyncNotification($localize`:@@userHive.pleaseWaitWeUpdateContents:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
      this.userService.savePayrollCustomField(this.userData._id, customFieldId, customFieldValue)
        .then(async (res) => {

          const field = this.hrCustomFields[this.hrCustomFields.findIndex(cf => cf.name == customFieldId)];
          if (field && !field.user_type) {
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

  // onInputEntityVariableChange(event: Event, variabledId: string) {
  //   const value = event.target['value'];
  //   this.savePayrollVariable(variabledId, value);
  // }

  // savePayrollVariable(variabledId: string, value: any) {
  //   this.utilityService.asyncNotification($localize`:@@userHive.pleaseWaitWeUpdateContents:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
  //     this.userService.savePayrollVariable(this.userData._id, variabledId, value)
  //       .then(async (res) => {

  //         const field = this.hrVariables[this.hrVariables.findIndex(cf => cf._id == variabledId)];
  //         if (field) {
  //           this.selectedHRVariablesValues[variabledId] = value;
  //           this.userData.hr.entity_variables[variabledId] = value;
  //         }

  //         // Resolve with success
  //         resolve(this.utilityService.resolveAsyncPromise($localize`:@@userHive.cfUpdated:Field updated!`));
  //       })
  //       .catch(() => {
  //         reject(this.utilityService.rejectAsyncPromise($localize`:@@userHive.unableToUpdateCF:Unable to update field, please try again!`));
  //       });
  //   }));
  // }

  formateDate(date) {
    return (date) ? moment(moment.utc(date), "YYYY-MM-DD").toDate() : '';
  }
}
