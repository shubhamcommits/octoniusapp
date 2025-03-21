import { Component, OnInit, OnChanges, Input, Injector } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { UserService } from 'src/shared/services/user-service/user.service';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { GroupsService } from 'src/shared/services/groups-service/groups.service';

@Component({
  selector: 'app-user-profile-custom-fields',
  templateUrl: './user-profile-custom-fields.component.html',
  styleUrls: ['./user-profile-custom-fields.component.scss'],
})
export class UserProfileCustomFieldsComponent implements OnInit, OnChanges {

  // User Data Object
  @Input('userData') userData: any = {};

  // Is current user variable
  @Input('currentUser') currentUser: boolean = false;

  @Input() workspaceData;

  customFields: any = [];
  selectedCFValues: any = [];

  // Public Functions class
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public utilityService: UtilityService,
    public userService: UserService,
    public groupService: GroupService,
    public groupsService: GroupsService,
    public workspaceService: WorkspaceService,
    public injector: Injector
  ) { }

  ngOnInit() {

  }

  ngOnChanges() {
    this.customFields = [];
    this.selectedCFValues = [];

    this.workspaceService.getProfileCustomFields(this.userData._workspace).then((res) => {
      if (res['workspace']['profile_custom_fields']) {
        res['workspace']['profile_custom_fields'].forEach(async field => {

          if (!this.userData.profile_custom_fields) {
            this.userData.profile_custom_fields = new Map<string, string>();
          }

          if (!this.userData.profile_custom_fields[field.name]) {
            this.userData.profile_custom_fields[field.name] = '';
            this.selectedCFValues[field.name] = '';
          } else {
            if (!field.user_type) {
              this.selectedCFValues[field.name] = this.userData.profile_custom_fields[field.name];
            } else {
              this.selectedCFValues[field.name] = await this.publicFunctions.getOtherUser(this.userData.profile_custom_fields[field.name]);
            }
          }

          const ldapFieldValue = this.selectedCFValues[field.name];
          if (ldapFieldValue && field.values.findIndex(value => value == ldapFieldValue) < 0) {
            field.values.push(ldapFieldValue);
          }

          if (this.currentUser || ['owner', 'admin', 'manager'].includes(this.userData?.role) || !field.hide_in_business_card) {
            this.customFields.push(field);
          }
        });
      }
    });
  }

  onCustomFieldChange(event: Event, customFieldName: string) {
    const customFieldValue = event['value'];
    this.saveCustomField(customFieldName, customFieldValue);
  }

  saveCustomField(customFieldName: string, customFieldValue: any) {
    this.utilityService.asyncNotification($localize`:@@userProfileCF.pleaseWaitWeUpdateContents:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
      this.userService.saveCustomField(this.userData._id, customFieldName, customFieldValue)
        .then(async (res) => {

          const field = this.customFields[this.customFields.findIndex(cf => cf.name == customFieldName)];
          if (field && !field.user_type) {
            this.selectedCFValues[customFieldName] = customFieldValue;
            this.userData.profile_custom_fields[customFieldName] = customFieldValue;
          }

          this.autoUpdateGroups();

          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@userProfileCF.cfUpdated:${customFieldName} updated!`));
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@userProfileCF.unableToUpdateCF:Unable to update ${customFieldName}, please try again!`));
        });
    }));
  }

  /**
   * Executes whenever a custom field changes its value.
   * Responsible for automatically adding or removing
   * group members.
   */
  autoUpdateGroups() {
    const workspaceId = this.userData._workspace._id || this.userData._workspace;
    this.groupsService.getWorkspaceGroups(workspaceId)
      .then(res => {
        res['groups'].forEach(group => {
          this.groupService.updateSmartGroupMembers(
            group._id || group,
            {
              workspaceId: workspaceId
            }
          ).subscribe(
            res => {
              this.publicFunctions.sendUpdatesToGroupData(res['group']);
            },
            error => {
              this.utilityService.errorNotification($localize`:@@userProfileCF.errorOccurredWhileModifyingMembers:An error occurred while modifying the members of the group.`);
              console.error(error);
            }
          );
        });
      });
  }

  isValueInOptions(cfValues, selectedValue) {
    return cfValues.findIndex(value => value == selectedValue) >= 0;
  }

  selectUser(customFieldName, user) {
    this.selectedCFValues[customFieldName] = user;
    this.saveCustomField(customFieldName, user._id);
  }
}
