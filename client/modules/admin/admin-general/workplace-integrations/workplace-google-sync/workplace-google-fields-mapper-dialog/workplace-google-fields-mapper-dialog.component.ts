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

  propertiesToMap = [];
  profileCustomFields;
  mapSelectedProperties = new Map();

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
      private injector: Injector,
      private utilityService: UtilityService,
      private workspaceService: WorkspaceService,
      @Inject(MAT_DIALOG_DATA) public data: any,
      private mdDialogRef: MatDialogRef<WorkplaceGoogleFieldsMapperDialogComponent>
      ) { }

  async ngOnInit(): Promise<void> {
    this.workplaceData = await this.publicFunctions.getCurrentWorkspace();
    this.userData = await this.publicFunctions.getCurrentUser();

    this.googleSchemas = this.data.googleSchemas;

    this.profileCustomFields = this.workplaceData?.profile_custom_fields;
    const googlePropertiesMap = this.workplaceData?.googlePropertiesMap;
    if (googlePropertiesMap) {
      Object.keys(googlePropertiesMap).forEach(property => {
        this.propertiesToMap.push(property);
        this.mapSelectedProperties.set(property, googlePropertiesMap[property]);
      });
    }
  }

  getOctoniusProperty(property) {
    let retPoperty = this.mapSelectedProperties.get(property);
    return (retPoperty && retPoperty.length > 1) ? retPoperty[1] : ((retPoperty) ? retPoperty : '');
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

  changePropertyValue($event, schemaName: string, propertyName: string) {
    let index = this.propertiesToMap.findIndex(prop => prop == propertyName);
    if (index >= 0) {
      this.mapSelectedProperties.set(propertyName, [schemaName, $event.value]);
    }
  }

  onCloseDialog() {
    this.closeEvent.emit();
    this.mdDialogRef.close();
  }

  mapProperties() {
    if (this.propertiesToMap && this.propertiesToMap.length > 0) {
      this.utilityService.getConfirmDialogAlert($localize`:@@workplaceGoogleFieldsMapperDialog.areYouSure:Are you sure?`,
        $localize`:@@workplaceGoogleFieldsMapperDialog.byDoingGoogleFields:By doing this, you will select the fields to map, and users' information will be synchronized with Google!`)
        .then(async (resp) => {
          if (resp.value) {
            this.utilityService.updateIsLoadingSpinnerSource(true);

            this.utilityService.asyncNotification($localize`:@@workplaceGoogleFieldsMapperDialog.pleaseWaitMappingProperties:Please wait we are mapping the new properties...`,
              new Promise((resolve, reject) => {
                this.workspaceService.googleWorkspaceUsersInfo(this.workplaceData?._id, this.mapSelectedProperties).then(res => {
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

  isNotEmptyProperty(property: string) {
    return (property && property != undefined && property != null && property != 'undefined' && property != 'null' && property != '');
  }
}
