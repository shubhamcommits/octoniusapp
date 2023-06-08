import { Component, OnInit, Inject, Injector, Output, EventEmitter } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
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
        private userService: UserService,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private mdDialogRef: MatDialogRef<WorkplaceLdapFieldsMapperDialogComponent>
        ) { }

    async ngOnInit(): Promise<void> {
      this.workplaceData = await this.publicFunctions.getCurrentWorkspace();
      this.userData = await this.publicFunctions.getCurrentUser();

      this.ldapPropertiesNames = this.data.ldapPropertiesNames;
      this.isGlobal = this.data.isGlobal;
      this.userLdapData = this.data.userLdapData;

      // if (!this.workplaceData.ldap_user_properties_cf) {
      //   this.workplaceData.ldap_user_properties_cf = [];
      // }
      //this.profileCustomFields = Object.keys(this.workplaceData?.profile_custom_fields);
      this.profileCustomFields = this.workplaceData?.profile_custom_fields;
      const ldapPropertiesMap = this.workplaceData?.ldapPropertiesMap;
      if (ldapPropertiesMap) {
        Object.keys(ldapPropertiesMap).forEach(property => {
          this.ldapPropertiesToMap.push(property);
          //this.mapSelectedProperties[property];
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

    /*
    isUserProperty(ldapProperty: string) {
      let index = this.workplaceData?.ldap_user_properties_cf.findIndex(prop => prop == ldapProperty)
      let isSetToMap = index >= 0;
      if (isSetToMap) {
        this.workplaceData?.ldap_user_properties_cf.splice(index, 1);
      } else {
        this.workplaceData?.ldap_user_properties_cf.push(ldapProperty);
      }
    }
    */

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
        let text = '';
        if (!this.isGlobal) {
          text = $localize`:@@workplaceLdapFieldsMapperDialog.byDoingLDAPSync:By doing this, user's information will be synchronized with LDAP!`
        } else {
          text = $localize`:@@workplaceLdapFieldsMapperDialog.byDoingLDAPFields:By doing this, you will select the fields to map with LDAP!`
        }
        this.utilityService.getConfirmDialogAlert($localize`:@@workplaceLdapFieldsMapperDialog.areYouSure:Are you sure?`, text)
          .then(async (resp) => {
            if (resp.value) {
              this.utilityService.updateIsLoadingSpinnerSource(true);

              if (!this.isGlobal) {
                for (let i = 0; i < this.ldapPropertiesToMap.length; i++) {
                  const property = this.ldapPropertiesToMap[i];
                  if (!this.userData.profile_custom_fields) {
                    this.userData.profile_custom_fields = new Map<string, string>();
                  }

                  if (this.isNotEmptyProperty(property) && this.isNotEmptyProperty(this.userLdapData[property]) && this.isNotEmptyProperty(this.getOctoniusProperty(property))) {
                    this.userData.profile_custom_fields[this.getOctoniusProperty(property)] = this.userLdapData[property];
                  }
                }

                this.utilityService.asyncNotification($localize`:@@workplaceLdapFieldsMapperDialog.pleaseWaitSavingProperties:Please wait we are saving the properties...`,
                  new Promise((resolve, reject) => {
                      this.userService.saveCustomFieldsFrom3rdPartySync(this.userData?._id, this.workplaceData?._id, this.userData.profile_custom_fields).then(res => {
                        this.userData = res['user'];
                        this.publicFunctions.sendUpdatesToUserData(this.userData);
                        this.utilityService.updateIsLoadingSpinnerSource(false);
                        resolve(this.utilityService.resolveAsyncPromise($localize`:@@workplaceLdapFieldsMapperDialog.userSaved:User Saved!`));
                        this.onCloseDialog();
                      }).catch(err => {
                        this.utilityService.updateIsLoadingSpinnerSource(false);
                        reject(this.utilityService.rejectAsyncPromise($localize`:@@workplaceLdapFieldsMapperDialog.unableToSave:Unable to save the settings, please try again!`));
                      });
                }));
              } else {
                this.utilityService.asyncNotification($localize`:@@workplaceLdapFieldsMapperDialog.pleaseWaitMappingProperties:Please wait we are mapping the new properties...`,
                  new Promise((resolve, reject) => {
                      this.workspaceService.ldapWorkspaceUsersInfo(this.workplaceData?._id, this.mapSelectedProperties/*, this.userData?.email, this.ldapPropertiesToMap, this.workplaceData?.ldap_user_properties_cf, this.isGlobal*/).then(res => {
                        this.workplaceData = res['workspace'];
                        this.publicFunctions.sendUpdatesToWorkspaceData(this.workplaceData);
                        this.utilityService.updateIsLoadingSpinnerSource(false);
                        resolve(this.utilityService.resolveAsyncPromise($localize`:@@workplaceLdapFieldsMapperDialog.propertiesSaved:Properties to Map Saved!`));
                        this.onCloseDialog();
                      }).catch(err => {
                        this.utilityService.updateIsLoadingSpinnerSource(false);
                        reject(this.utilityService.rejectAsyncPromise($localize`:@@workplaceLdapFieldsMapperDialog.unableToSave:Unable to save the settings, please try again!`));
                      });
                }));
              }
            }
        });
    }
  }

  isNotEmptyProperty(property: string) {
    return (property && property != undefined && property != null && property != 'undefined' && property != 'null' && property != '');
  }
}
