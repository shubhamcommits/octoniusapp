import { Component, OnInit, Inject, Injector, Output, EventEmitter } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { UserService } from 'src/shared/services/user-service/user.service';

@Component({
  selector: 'app-workplace-google-fields-mapper-dialog',
  templateUrl: './workplace-google-fields-mapper-dialog.component.html',
  styleUrls: ['./workplace-google-fields-mapper-dialog.component.scss']
})
export class WorkplaceGoogleFieldsMapperDialogComponent implements OnInit {

  @Output() closeEvent = new EventEmitter();

  workplaceData;
  userData;

  googleSchemas;
  isGlobal;
  userGoogleData;

  propertiesToMap = [];
  profileCustomFields;
  selectedProperties = [];

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
      private injector: Injector,
      private utilityService: UtilityService,
      private workspaceService: WorkspaceService,
      private userService: UserService,
      @Inject(MAT_DIALOG_DATA) public data: any,
      private mdDialogRef: MatDialogRef<WorkplaceGoogleFieldsMapperDialogComponent>
      ) { }

  async ngOnInit(): Promise<void> {
    this.workplaceData = await this.publicFunctions.getCurrentWorkspace();
    this.userData = await this.publicFunctions.getCurrentUser();

    this.googleSchemas = this.data.googleSchemas;
    this.isGlobal = this.data.isGlobal;
    this.userGoogleData = this.data.userGoogleData;

    this.profileCustomFields = this.workplaceData?.profile_custom_fields;
    if (this.workplaceData?.googlePropertiesMap) {
      this.selectedProperties = this.workplaceData?.googlePropertiesMap;
    }
console.log(this.googleSchemas);
console.log(this.userGoogleData);
console.log(this.userData);
console.log(this.workplaceData);
console.log(this.selectedProperties);
  }

  async getOctoniusProperty(googleSchemaName: string, googlePropertyName: string) {
    const selectedIndex = await this.getSelectedIndex(googlePropertyName, googleSchemaName);
    return (selectedIndex >= 0 && this.selectedProperties[selectedIndex] && this.selectedProperties[selectedIndex].octonius_property)
      ? this.selectedProperties[selectedIndex].octonius_property
      : '';
  }

  selectProperty(property: string) {
    let index = this.propertiesToMap.findIndex(prop => prop == property)
    let isSetToMap = index >= 0;
    if (isSetToMap) {
      this.propertiesToMap.splice(index, 1);
    } else {
      this.propertiesToMap.push(property);
    }
  }

  getSelectedIndex(googleSchemaName: string, googlePropertyName: string) {
    return (this.selectedProperties) ? this.selectedProperties.findIndex(p => p.google_property == googlePropertyName && p.google_schema == googleSchemaName) : -1;
  }

  async changePropertyValue($event, schemaName: string, propertyName: string) {
    let index = this.propertiesToMap.findIndex(prop => prop == propertyName);
    if (index >= 0) {
      const selectedIndex = await this.getSelectedIndex(schemaName, propertyName);
      if (selectedIndex >= 0) {
        this.selectedProperties[index].octonius_property = $event.value
      } else {
        this.selectedProperties.push({
          google_property: propertyName,
          google_schema: schemaName,
          octonius_property: $event.value
        });
      }
    }
  }

  onCloseDialog() {
    this.closeEvent.emit();
    this.mdDialogRef.close();
  }

  async mapProperties() {
console.log(this.selectedProperties);
    let text = '';
    if (!this.isGlobal) {
      text = $localize`:@@workplaceGoogleFieldsMapperDialog.byDoingGoogleSync:By doing this, user's information will be synchronized with Google!`
    } else {
      text = $localize`:@@workplaceGoogleFieldsMapperDialog.byDoingGoogleFields:By doing this, you will select the fields to map with Google!`//, and users' information will be synchronized with Google!`
    }
    
    if (!this.isGlobal) {
      for (let i = 0; i < this.propertiesToMap.length; i++) {
        const property = this.propertiesToMap[i];
        if (!this.userData.profile_custom_fields) {
          this.userData.profile_custom_fields = new Map<string, string>();
        }

        if (this.isNotEmptyProperty(property.google_property) && this.isNotEmptyProperty(this.userGoogleData['customSchemas'][property.google_schema][property.google_property]) && this.isNotEmptyProperty(await this.getOctoniusProperty(property.google_schema, property.google_property))) {
          this.userData.profile_custom_fields[await this.getOctoniusProperty(property.google_schema, property.google_property)] = this.userGoogleData['customSchemas'][property.google_schema][property.google_property];
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
      if (this.propertiesToMap && this.propertiesToMap.length > 0) {
        this.utilityService.getConfirmDialogAlert($localize`:@@workplaceGoogleFieldsMapperDialog.areYouSure:Are you sure?`, text)
          .then(async (resp) => {
            if (resp.value) {
              this.utilityService.updateIsLoadingSpinnerSource(true);

              this.utilityService.asyncNotification($localize`:@@workplaceGoogleFieldsMapperDialog.pleaseWaitMappingProperties:Please wait we are mapping the new properties...`,
                new Promise((resolve, reject) => {
console.log(this.selectedProperties);
                  this.workspaceService.googleWorkspaceUsersInfo(this.workplaceData?._id, this.selectedProperties).then(res => {
                    this.workplaceData = res['workspace'];
                    this.publicFunctions.sendUpdatesToWorkspaceData(this.workplaceData);
                    this.utilityService.updateIsLoadingSpinnerSource(false);
                    resolve(this.utilityService.resolveAsyncPromise($localize`:@@workplaceGoogleFieldsMapperDialog.propertiesSaved:Properties to Map Saved!`));
                    this.onCloseDialog();
                  }).catch(err => {
                    this.utilityService.updateIsLoadingSpinnerSource(false);
                    reject(this.utilityService.rejectAsyncPromise($localize`:@@workplaceGoogleFieldsMapperDialog.unableToSave:Unable to save the settings, please try again!`));
                  });
              }));
            }
        });
      }
    }
  }

  isNotEmptyProperty(property: string) {
    return (property && property != undefined && property != null && property != 'undefined' && property != 'null' && property != '');
  }
}
