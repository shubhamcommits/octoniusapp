import { Component, Inject, Injector, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-member-dialog',
  templateUrl: './member-dialog.component.html',
  styleUrls: ['./member-dialog.component.scss']
})
export class MemberDialogComponent implements OnInit {

  userId;
  userData;
  groupData;
  currentWorkspace;
  currentUser;

  // Public functions class member
  publicFunctions = new PublicFunctions(this.injector);

  // Is current user component
  isCurrentUser: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private mdDialogRef: MatDialogRef<MemberDialogComponent>,
    private injector: Injector,
    private userService: UserService,
    private utilityService: UtilityService,
  ) { }

  async ngOnInit() {
    this.currentWorkspace = await this.publicFunctions.getCurrentWorkspace();
    this.currentUser = await this.publicFunctions.getCurrentUser();
    this.groupData = await this.publicFunctions.getCurrentGroupDetails();

    this.userId = this.data.userId;

    this.isCurrentUser = this.userId == this.currentUser?._id;

    if (this.userId) {
      await this.publicFunctions.getOtherUser(this.userId).then((res) => {
        if(JSON.stringify(res) != JSON.stringify({})){
          this.userData = res;
        }
      });
    }

    if (this.currentWorkspace?.profile_custom_fields) {
      this.currentWorkspace.profile_custom_fields = this.currentWorkspace?.profile_custom_fields.filter(pcf => {
        return !pcf.hide_in_business_card || ['owner', 'admin', 'manager'].includes(this.currentUser?.role) || this.isCurrentUser;
      });

      this.currentWorkspace?.profile_custom_fields.forEach(async field => {

        if (!this.userData.profile_custom_fields) {
          this.userData.profile_custom_fields = new Map<string, string>();
        }

        if (!this.userData.profile_custom_fields[field.name]) {
          this.userData.profile_custom_fields[field.name] = '';
        } else {
          if (!field.user_type) {
            this.userData.profile_custom_fields[field.name] = this.userData.profile_custom_fields[field.name];
          } else {
            this.userData.profile_custom_fields[field.name] = await this.publicFunctions.getOtherUser(this.userData.profile_custom_fields[field.name]);
          }
        }
      });
    }
  }

  saveProperty(propertyToSave: any) {
    this.utilityService.asyncNotification($localize`:@@editHRFields.pleaseWaitWeUpdateContents:Please wait we are updating the contents...`, new Promise((resolve, reject) => {

      this.userService.updateUserProperty(this.userData._id, propertyToSave)
        .then(async (res) => {
          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@editHRFields.updated:User HR field updated!`));
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@editHRFields.unableToUpdate:Unable to update HR field, please try again!`));
        });
    }));
  }

  closeDialog() {
    this.mdDialogRef.close();
  }

  isGroupManager(userId) {
    return (this.groupData && this.groupData._admins) ? this.groupData._admins.find(admin => admin._id === userId) : false;
  }
}
