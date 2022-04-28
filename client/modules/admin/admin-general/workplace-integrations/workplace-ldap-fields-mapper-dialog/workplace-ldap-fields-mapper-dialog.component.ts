import { Component, OnInit, Inject, Injector, Output, EventEmitter } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { PublicFunctions } from 'modules/public.functions';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { UserService } from 'src/shared/services/user-service/user.service';

@Component({
    selector: 'app-workplace-ldap-fields-mapper-dialog',
    templateUrl: './workplace-ldap-fields-mapper-dialog.component.html',
    styleUrls: ['./workplace-ldap-fields-mapper-dialog.component.scss']
  })
  export class WorkplaceLdapFieldsMapperDialogComponent implements OnInit {

    @Output() closeEvent = new EventEmitter();

    workplaceData;
    userData;

    ldapPropertiesNames;
    isGlobal;
    userLdapData;

    ldapPropertiesToMap = [];
    profileCustomFields;
    mapSelectedProperties = new Map();

    // PUBLIC FUNCTIONS
    public publicFunctions = new PublicFunctions(this.injector);

    constructor(
        private injector: Injector,
        private utilityService: UtilityService,
        private workspaceService: WorkspaceService,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private mdDialogRef: MatDialogRef<WorkplaceLdapFieldsMapperDialogComponent>
        ) { }

    async ngOnInit(): Promise<void> {
      this.workplaceData = await this.publicFunctions.getCurrentWorkspace();
      this.userData = await this.publicFunctions.getCurrentUser();

      this.ldapPropertiesNames = this.data.ldapPropertiesNames;
      this.isGlobal = this.data.isGlobal;
      this.userLdapData = this.data.userLdapData;

      if (!this.workplaceData.ldap_user_properties_cf) {
        this.workplaceData.ldap_user_properties_cf = [];
      }
      //this.profileCustomFields = Object.keys(this.workplaceData?.profile_custom_fields);
      this.profileCustomFields = this.workplaceData?.profile_custom_fields;
      const ldapPropertiesMap = this.workplaceData?.ldapPropertiesMap;
      if (ldapPropertiesMap) {
        Object.keys(ldapPropertiesMap).forEach(property => {
          this.ldapPropertiesToMap.push(property);
          this.mapSelectedProperties[property];
          this.mapSelectedProperties.set(property, ldapPropertiesMap[property]);
        });
      }
    }

    getOctoniusProperty(ldapProperty) {
      //const index = (this.profileCustomFields) ? this.profileCustomFields.findIndex(cf => cf.title == ldapProperty) : -1;
      //return (index >= 0) ? this.profileCustomFields[index].name : "";
      return this.mapSelectedProperties.get(ldapProperty);
    }

    selectProperty(ldapProperty: string) {
      let index = this.ldapPropertiesToMap.findIndex(prop => prop == ldapProperty)
      let isSetToMap = index >= 0;
      if (isSetToMap) {
        this.ldapPropertiesToMap.splice(index, 1);
      } else {
        this.ldapPropertiesToMap.push(ldapProperty);
      }
    }

    isUserProperty(ldapProperty: string) {
      let index = this.workplaceData?.ldap_user_properties_cf.findIndex(prop => prop == ldapProperty)
      let isSetToMap = index >= 0;
      if (isSetToMap) {
        this.workplaceData?.ldap_user_properties_cf.splice(index, 1);
      } else {
        this.workplaceData?.ldap_user_properties_cf.push(ldapProperty);
      }
    }

    changePropertyValue($event, ldapPropertyName: string) {
      let index = this.ldapPropertiesToMap.findIndex(prop => prop == ldapPropertyName);
      if (index >= 0) {
        this.mapSelectedProperties.set(ldapPropertyName, $event.value);
      }
    }

    onCloseDialog() {
      this.closeEvent.emit();
      this.mdDialogRef.close();
    }

    mapProperties() {
      if (this.ldapPropertiesToMap && this.ldapPropertiesToMap.length > 0) {
        this.utilityService.getConfirmDialogAlert($localize`:@@workplaceLdapFieldsMapperDialog.areYouSure:Are you sure?`, $localize`:@@workplaceLdapFieldsMapperDialog.byDoingLDAPSync:By doing this, all users' information will be synchronized with LDAP!`)
        .then(async (resp) => {
          if (resp.value) {
            this.utilityService.updateIsLoadingSpinnerSource(true);

            this.utilityService.asyncNotification($localize`:@@workplaceLdapFieldsMapperDialog.pleaseWaitMappingProperties:Please wait we are mapping the new properties...`,
              new Promise((resolve, reject) => {
                  this.workspaceService.ldapWorkspaceUsersInfo(this.workplaceData?._id, this.userData?.email, this.ldapPropertiesToMap, this.mapSelectedProperties, this.workplaceData?.ldap_user_properties_cf, this.isGlobal).then(res => {
                    this.userData = res['user'];
                    this.publicFunctions.sendUpdatesToUserData(this.userData);
                    this.utilityService.updateIsLoadingSpinnerSource(false);
                    resolve(this.utilityService.resolveAsyncPromise($localize`:@@workplaceLdapFieldsMapperDialog.settingsSaved:Properties Mapped & Users Updated!`));
                    this.onCloseDialog();
                  }).catch(err => {
                    this.utilityService.updateIsLoadingSpinnerSource(false);
                    reject(this.utilityService.rejectAsyncPromise($localize`:@@workplaceLdapFieldsMapperDialog.unableToSave:Unable to save the settings, please try again!`));
                  });
            }));
          }
      });
      }
  }
}
