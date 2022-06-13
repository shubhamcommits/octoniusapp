import { Component, Inject, Injector, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-member-dialog',
  templateUrl: './member-dialog.component.html',
  styleUrls: ['./member-dialog.component.scss']
})
export class MemberDialogComponent implements OnInit {

  userId;
  userData;
  currentWorkspace;
  currentUser;

  userBaseUrl = environment.UTILITIES_USERS_UPLOADS;

  // Public functions class member
  publicFunctions = new PublicFunctions(this.injector);

  // Is current user component
  isCurrentUser: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private mdDialogRef: MatDialogRef<MemberDialogComponent>,
    private injector: Injector,
  ) { }

  async ngOnInit() {
    this.currentWorkspace = await this.publicFunctions.getCurrentWorkspace();
    this.currentUser = await this.publicFunctions.getCurrentUser();

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

  closeDialog() {
    this.mdDialogRef.close();
  }

}
