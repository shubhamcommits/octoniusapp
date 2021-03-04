import { Component, Inject, Injector, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { environment } from 'src/environments/environment';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { UserService } from "src/shared/services/user-service/user.service";

@Component({
  selector: 'app-user-update-profile-dialog',
  templateUrl: './user-update-profile-dialog.component.html',
  styleUrls: ['./user-update-profile-dialog.component.scss']
})
export class UserUpdateProfileDialogComponent implements OnInit {

  // Public functions class member
  publicFunctions = new PublicFunctions(this.injector);
  userData: any;
  password: string;
  repeatPassword: string;
  // Is current user component
  isCurrentUser: boolean = false;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private injector: Injector,
    private utilityService: UtilityService,
    private userService: UserService,
    private mdDialogRef: MatDialogRef<UserUpdateProfileDialogComponent>
  ) { }

  ngOnInit(): void {
    this.userData = this.data.userData;
  }

  matchUserPassword(event:any) {
    if (this.password != this.repeatPassword) {
      this.repeatPassword='';
      this.utilityService.asyncNotification('Please wait we are updating your information...',
        new Promise((resolve, reject) => {
          reject(this.utilityService.rejectAsyncPromise('Password did not match, please try again!'))
        }))
    }
  }

  updatePassword() {
    if (this.password != this.repeatPassword) {
      this.utilityService.asyncNotification('Please wait we are updating your information...',
        new Promise((resolve, reject) => {
          reject(this.utilityService.rejectAsyncPromise('Password did not match, please try again!'))
        }))
    } else {
      this.utilityService.asyncNotification('Please wait we are updating your information...',
        new Promise((resolve, reject) => {
          this.userService.changePassword({ _id: this.userData?._account?._id || this.userData?._account, password: this.password })
            .then(res => {
              resolve(this.utilityService.resolveAsyncPromise('Password updated sucessfully!'));
              this.mdDialogRef.close();
            })
            .catch(err => {
              reject(this.utilityService.rejectAsyncPromise('An unexpected occured while updating the password, please try again!'));
              this.mdDialogRef.close();
            })
        }))
    }
  }

}
