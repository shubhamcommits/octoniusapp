import { Component, OnInit, Injector, OnDestroy, AfterContentChecked } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { UserService } from 'src/shared/services/user-service/user.service';
import { GroupsService } from 'src/shared/services/groups-service/groups.service';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { WorkplaceLdapFieldsMapperDialogComponent } from 'modules/admin/admin-general/workplace-integrations/workplace-ldap-sync/workplace-ldap-fields-mapper-dialog/workplace-ldap-fields-mapper-dialog.component';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit, AfterContentChecked, OnDestroy {

  // User Data Variable
  userData: any;

  // Workspace Data Variable
  workspaceData: any;

  // Is current user component
  isCurrentUser: boolean = false;

  customFields: any = [];
  selectedCFValues: any = [];

  isLoading$;

  // Public functions class member
  publicFunctions = new PublicFunctions(this.injector);

  // UNSUBSCRIBE THE DATA
  private subSink = new SubSink();

  constructor(
    private injector: Injector,
    public dialog: MatDialog,
    private utilityService: UtilityService,
    private workspaceService: WorkspaceService,
    private userService: UserService,
    private groupsService: GroupsService,
    private groupService: GroupService
  ) { }

  async ngOnInit() {

    // Setting Home State
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'user-account'
    });

    this.userData = await this.publicFunctions.getCurrentUser();
    this.isCurrentUser = true;

    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    this.initProfileCustomFields();
  }

  ngAfterContentChecked() {
    this.subSink.add(this.utilityService.isLoadingSpinner.subscribe((res) => {
      this.isLoading$ = res;
    }));
  }

  ngOnDestroy() {
    this.subSink.unsubscribe();
  }

  initProfileCustomFields() {
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

          if (this.isCurrentUser || ['owner', 'admin', 'manager'].includes(this.userData?.role) || !field.hide_in_business_card) {
            this.customFields.push(field);
          }
        });
      }
    });
  }

  onUpdateUserEmitter(updatedUserData) {
    this.userData = updatedUserData;
  }

  onCustomFieldChange(event: Event, customFieldName: string) {
    const customFieldValue = event['value'];
    this.saveCustomField(customFieldName, customFieldValue);
  }

  selectUser(customFieldName, user) {
    this.selectedCFValues[customFieldName] = user;
    this.saveCustomField(customFieldName, user._id);
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

          this.publicFunctions.sendUpdatesToUserData(this.userData);

          this.autoUpdateGroups();

          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@userProfileCF.cfUpdated:${customFieldName} updated!`));
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@userProfileCF.unableToUpdateCF:Unable to update ${customFieldName}, please try again!`));
        });
    }));
  }

  saveProperty(property_name: string, value: any) {

    if (value != '') {
      this.userData[property_name] = value;
      
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
}
