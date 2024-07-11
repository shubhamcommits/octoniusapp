import { Component, OnInit, Inject, Injector, Output, EventEmitter } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
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
  userExistingValues = new Map<string, any>();
  
  octoGenericProperties = [
    { name: 'current_position', title: $localize`:@@workplaceGoogleFieldsMapperDialog.currentPosition:Current Position`},
    { name: 'company_join_date', title: $localize`:@@workplaceGoogleFieldsMapperDialog.joinDate:Join Date`},
    { name: 'phone_number', title: $localize`:@@workplaceGoogleFieldsMapperDialog.phoneNumber:Phone Number`},
    { name: 'mobile_number', title: $localize`:@@workplaceGoogleFieldsMapperDialog.mobileNumber:Mobile Number`},
    { name: 'address_line_1', title: $localize`:@@workplaceGoogleFieldsMapperDialog.address:Address`}
  ];
  genericPropertiesToMap = [];
  googleGenericProperties = [];
  selectedGenericProperties = [];
  userExistingGenericValues = new Map<string, any>();

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public utilityService: UtilityService,
    private injector: Injector,
    private workspaceService: WorkspaceService,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    // private changeDetectorRef: ChangeDetectorRef,
    private mdDialogRef: MatDialogRef<WorkplaceGoogleFieldsMapperDialogComponent>
  ) {}

  async ngOnInit(): Promise<void> {
    this.workplaceData = await this.publicFunctions.getCurrentWorkspace();
    this.userData = await this.publicFunctions.getCurrentUser();

    this.googleSchemas = this.data.googleSchemas;
    this.isGlobal = this.data.isGlobal;
    this.userGoogleData = this.data.userGoogleData;

    this.profileCustomFields = this.workplaceData?.profile_custom_fields;
    if (this.workplaceData?.googlePropertiesMap) {
      this.selectedProperties = this.workplaceData?.googlePropertiesMap;
    } else {
      this.selectedProperties = [];
    }
    if (this.workplaceData?.googleGenericPropertiesMap) {
      this.selectedGenericProperties = this.workplaceData?.googleGenericPropertiesMap;
    } else {
      this.selectedGenericProperties = [];
    }

    if(!!this.userGoogleData && !!this.userGoogleData.organizations) {
      const index = this.getPrimaryOrganizationIndex();
      if (index >= 0) {
        this.googleGenericProperties = Object.keys(this.userGoogleData.organizations[index]);
      }

      this.googleGenericProperties.push('phones');
      this.googleGenericProperties.push('addresses');
    }

    if (!this.propertiesToMap) {
      this.propertiesToMap = [];
    }

    if (!this.genericPropertiesToMap) {
      this.genericPropertiesToMap = [];
    }

    this.selectedProperties.forEach(prop => {
      const cf = this.getOctoniusProfileCustomField(prop.google_schema, prop.google_property);
      if (!!cf) {
        this.propertiesToMap.push({
          google_schema: prop.google_schema,
          google_property: prop.google_property
        });
      }
    });

    this.selectedGenericProperties.forEach(prop => {
      const gp = this.getOctoniusGenericProperty(prop.google_property);
      if (!!gp) {
        this.genericPropertiesToMap.push({
          google_property: prop.google_property
        });
      }
    });

    // this.userData?.profile_custom_fields?.forEach(async (value: any, key: string) => {
    Object.keys(this.userData?.profile_custom_fields).forEach(async (key) => {
      const value = this.userData?.profile_custom_fields[key];
      const selectedIndex = (this.selectedProperties) ? this.selectedProperties.findIndex(p => p.octonius_property == key) : -1;
      let pcf;

      if (selectedIndex >= 0 && this.selectedProperties[selectedIndex]) {
        const pcfName = this.selectedProperties[selectedIndex].octonius_property;
        const index = (!!this.profileCustomFields) ? this.profileCustomFields.findIndex(cf => cf.name == pcfName) : -1;

        if (index >= 0) {
          pcf = this.profileCustomFields[index];
        }
      }

      if (!!pcf && pcf.user_type) {
        const userCF: any = await this.publicFunctions.getOtherUser(value);
        if (!!userCF) {
          this.userExistingValues.set(key, userCF.email);
        } else {
          this.userExistingValues.set(key, value);
        }
      } else {
        this.userExistingValues.set(key, value);
      }
    });

    this.octoGenericProperties.forEach(gp => {
      if (gp.name == 'address_line_1') {
        this.userExistingGenericValues.set(gp.name, this.userData.hr[gp.name]);
      } else {
        this.userExistingGenericValues.set(gp.name, this.userData[gp.name]);
      }
    });
  }

  isUserCF(googleSchemaName: string, googlePropertyName: string) {
    const pcf = this.getOctoniusProfileCustomField(googleSchemaName, googlePropertyName);
    return (!!pcf && pcf.user_type);
  }

  getOctoniusProfileCustomField(googleSchemaName: string, googlePropertyName: string) {
    const octoPropertyName = this.getOctoniusProperty(googleSchemaName, googlePropertyName);
    const index = (!!this.profileCustomFields) ? this.profileCustomFields.findIndex(cf => cf.name == octoPropertyName) : -1;
    if (index >= 0) {
      return this.profileCustomFields[index];
    }
    return null;
  }

  getOctoniusProperty(googleSchemaName: string, googlePropertyName: string) {
    const selectedIndex = (this.selectedProperties) ? this.selectedProperties.findIndex(p => p.google_property == googlePropertyName && p.google_schema == googleSchemaName) : -1;
    if (selectedIndex >= 0 && this.selectedProperties[selectedIndex]) {
      return this.selectedProperties[selectedIndex].octonius_property;
    }
    return '';
  }

  getOctoniusGenericProperty(googlePropertyName: string) {
    const selectedIndex = (this.selectedGenericProperties) ? this.selectedGenericProperties.findIndex(p => p.google_property == googlePropertyName) : -1;

    if (selectedIndex >= 0 && this.selectedGenericProperties[selectedIndex]) {
      return this.selectedGenericProperties[selectedIndex].octonius_property;
    }
    return '';
  }

  getUserExistingValue(googleSchemaName: string, googlePropertyName: string) {
    const octoProperty = this.getOctoniusProperty(googleSchemaName, googlePropertyName);
    return (!!octoProperty && !!this.userExistingValues) ? this.userExistingValues.get(octoProperty) : '';
  }

  getUserGenericExistingValue(googlePropertyName: string) {
    const octoProperty = this.getOctoniusGenericProperty(googlePropertyName);
    return (!!octoProperty && !!this.userExistingGenericValues) ? this.userExistingGenericValues.get(octoProperty) : '';
  }

  getPrimaryOrganizationIndex() {
    return (!!this.userGoogleData && !!this.userGoogleData.organizations) ? this.userGoogleData.organizations.findIndex(org => (!!org && org.primary)) : -1;
  }

  getUserGoogleGenericProperty(googlePropertyName: string) {
    if (googlePropertyName == 'addresses') {
      let workAddresIndex = (!!this.userGoogleData && !!this.userGoogleData.addresses) ? this.userGoogleData.addresses.findIndex(add => (!!add && add.type == 'work')) : -1;
      if (workAddresIndex < 0 && !!this.userGoogleData && !!this.userGoogleData.addresses && !!this.userGoogleData.addresses[0]) {
        workAddresIndex = 0;
      }

      return (workAddresIndex >= 0 && !!this.userGoogleData && !!this.userGoogleData.addresses && !!this.userGoogleData.addresses[workAddresIndex])
        ? this.userGoogleData.addresses[workAddresIndex].formatted
        : '';

    } else if (googlePropertyName == 'phones') {
      let workPhoneIndex = (!!this.userGoogleData && !!this.userGoogleData.phones) ? this.userGoogleData.phones.findIndex(ph => (!!ph && ph.type == 'work')) : -1;
      if (workPhoneIndex < 0 && !!this.userGoogleData && !!this.userGoogleData.phones && !!this.userGoogleData.phones[0]) {
        workPhoneIndex = 0;
      }

      return (workPhoneIndex >= 0 && !!this.userGoogleData && !!this.userGoogleData.phones && !!this.userGoogleData.phones[workPhoneIndex])
        ? this.userGoogleData.phones[workPhoneIndex].value
        : '';
    } else {
      const index = this.getPrimaryOrganizationIndex();
      return (index >= 0 && !!this.userGoogleData && !!this.userGoogleData.organizations && !!this.userGoogleData.organizations[index])
        ? this.userGoogleData.organizations[index][googlePropertyName]
        : '';
    }
  }

  async selectProperty(schemaName: string, fieldName: string) {
    let index = await this.getPropertiesToMapIndex(schemaName, fieldName);
    if (index >= 0) {
      this.propertiesToMap.splice(index, 1);
    } else {
      this.propertiesToMap.push({
        google_schema: schemaName,
        google_property: fieldName
      });
    }

    // this.changeDetectorRef.detectChanges();
  }

  async selectGenericProperty(fieldName: string) {
    let index = await this.getGenericPropertiesToMapIndex(fieldName);
    if (index >= 0) {
      this.genericPropertiesToMap.splice(index, 1);
    } else {
      this.genericPropertiesToMap.push({
        google_property: fieldName
      });
    }
  }

  getPropertiesToMapIndex(googleSchemaName: string, googlePropertyName: string) {
    return (this.propertiesToMap) ? this.propertiesToMap.findIndex(p => p.google_property == googlePropertyName && p.google_schema == googleSchemaName) : -1;
  }

  getGenericPropertiesToMapIndex(googlePropertyName: string) {
    return (this.propertiesToMap) ? this.genericPropertiesToMap.findIndex(p => p.google_property == googlePropertyName) : -1;
  }

  isPropertySelected(googleSchemaName: string, googlePropertyName: string) {
    const index = this.getPropertiesToMapIndex(googleSchemaName, googlePropertyName);
    return index >= 0;
  }

  isGenericPropertySelected(googlePropertyName: string) {
    const index = this.getGenericPropertiesToMapIndex(googlePropertyName);
    return index >= 0;
  }

  getSelectedIndex(googleSchemaName: string, googlePropertyName: string) {
    return (this.selectedProperties) ? this.selectedProperties.findIndex(p => p.google_property == googlePropertyName && p.google_schema == googleSchemaName) : -1;
  }

  getGenericSelectedIndex(googlePropertyName: string) {
    return (this.selectedGenericProperties) ? this.selectedGenericProperties.findIndex(p => p.google_property == googlePropertyName) : -1;
  }

  changePropertyValue($event, schemaName: string, propertyName: string) {
    let index = this.getPropertiesToMapIndex(schemaName, propertyName);
    if (index < 0) {
      this.selectProperty(schemaName, propertyName);
    }

    const selectedIndex = this.getSelectedIndex(schemaName, propertyName);
    if (selectedIndex >= 0) {
      this.selectedProperties[selectedIndex].octonius_property = $event.value
    } else {
      this.selectedProperties.push({
        google_property: propertyName,
        google_schema: schemaName,
        octonius_property: $event.value
      });
    }
  }

  changeGenericPropertyValue($event, propertyName: string) {
    let index = this.getGenericPropertiesToMapIndex(propertyName);
    if (index < 0) {
      this.selectGenericProperty(propertyName);
    }

    const selectedIndex = this.getGenericSelectedIndex(propertyName);
    if (selectedIndex >= 0) {
      this.selectedGenericProperties[selectedIndex].octonius_property = $event.value
    } else {
      this.selectedGenericProperties.push({
        google_property: propertyName,
        octonius_property: $event.value
      });
    }
  }

  onCloseDialog() {
    this.closeEvent.emit();
    this.mdDialogRef.close();
  }

  async mapProperties() {
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
          const octoPropertyTitle = await this.getOctoniusProperty(property.google_schema, property.google_property);
          // Test if the user CF is an email, if it is not it will be saved as null
          if (this.isUserCF(property.google_schema, property.google_property)) {
            const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (re.test(String(this.userGoogleData['customSchemas'][property.google_schema][property.google_property]).toLowerCase())) {
              this.userData.profile_custom_fields[octoPropertyTitle] = this.userGoogleData['customSchemas'][property.google_schema][property.google_property];
            }
          } else {
            this.userData.profile_custom_fields[octoPropertyTitle] = this.userGoogleData['customSchemas'][property.google_schema][property.google_property];
          }
        }
      }

      let genericPropertiesToSubmit: any = {};
      for (let i = 0; i < this.genericPropertiesToMap.length; i++) {
        const property = this.genericPropertiesToMap[i];
        
        if (!this.selectedGenericProperties) {
          this.selectedGenericProperties = [];
        }

        if (!!property && this.isNotEmptyProperty(property.google_property)) {
          const index = this.getGenericSelectedIndex(property.google_property);
          if (index >= 0 && !!this.selectedGenericProperties[index] && !!this.selectedGenericProperties[index].octonius_property && !!this.selectedGenericProperties[index].google_property) {
            switch (this.selectedGenericProperties[index].octonius_property) {
              case 'address_line_1':
                genericPropertiesToSubmit.address_line_1 = this.getUserGoogleGenericProperty(property.google_property);
                break;
              case 'current_position':
                genericPropertiesToSubmit.current_position = this.getUserGoogleGenericProperty(property.google_property);                      
                break;
              case 'company_join_date':
                genericPropertiesToSubmit.company_join_date = this.getUserGoogleGenericProperty(property.google_property);
                break;
              case 'phone_number':
                genericPropertiesToSubmit.phone_number = this.getUserGoogleGenericProperty(property.google_property);
                break;
              case 'mobile_number':
                genericPropertiesToSubmit.mobile_number = this.getUserGoogleGenericProperty(property.google_property);
                break;
            }
          }
        }
      }

      this.utilityService.asyncNotification($localize`:@@workplaceLdapFieldsMapperDialog.pleaseWaitSavingProperties:Please wait we are saving the properties...`,
        new Promise((resolve, reject) => {
          this.userService.saveCustomFieldsFrom3rdPartySync(this.userData?._id, this.workplaceData?._id, this.userData.profile_custom_fields, genericPropertiesToSubmit).then(res => {
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
                  this.workspaceService.googleWorkspaceUsersInfo(this.workplaceData?._id, this.selectedProperties, this.selectedGenericProperties).then(res => {
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
