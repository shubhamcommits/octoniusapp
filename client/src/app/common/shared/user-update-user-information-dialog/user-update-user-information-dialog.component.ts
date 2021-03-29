import { Component, Inject,Output ,EventEmitter,Injector, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { environment } from 'src/environments/environment';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { UserService } from "src/shared/services/user-service/user.service";

@Component({
  selector: 'app-user-update-user-information-dialog',
  templateUrl: './user-update-user-information-dialog.component.html',
  styleUrls: ['./user-update-user-information-dialog.component.scss']
})
export class UserUpdateUserInformationDialogComponent implements OnInit {

  @Output() closeEvent = new EventEmitter();
  // Public functions class member
  publicFunctions = new PublicFunctions(this.injector);
  userData: any;
  email: string;
  first_name: string;
  last_name: string;
  mobile_number: string;
  phone_number: string;
  company_name: string;
  // Is current user component
  isCurrentUser: boolean = false;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private injector: Injector,
    private utilityService: UtilityService,
    private userService: UserService,
    private mdDialogRef: MatDialogRef<UserUpdateUserInformationDialogComponent>
  ) { }

  ngOnInit(): void {
    this.userData = this.data.userData;
    this.email = this.userData?.email || '';
    this.first_name = this.userData?.first_name || '';
    this.last_name = this.userData?.last_name || '';
    this.mobile_number = this.userData?.mobile_number || '';
    this.phone_number = this.userData?.phone_number || '';
    this.company_name = this.userData?.company_name || '';
  }

  updateInfo() {
    const data = {
      email : this.email,
      first_name : this.first_name,
      last_name : this.last_name,
      full_name: this.first_name+" "+this.last_name,
      mobile_number : this.mobile_number,
      phone_number : this.phone_number,
      company_name : this.company_name
    }
    this.utilityService.asyncNotification('Please wait we are updating your information...', new Promise((resolve, reject) => {
      this.publicFunctions.userDetailsServiceFunction(this.userService,data)
        .then((res) => {

          this.closeEvent.emit(res);
          this.mdDialogRef.close();

          resolve(this.utilityService.resolveAsyncPromise('Details updated sucessfully!'));
        }).catch((err) => {
          reject(this.utilityService.rejectAsyncPromise(err.error.message || 'An unexpected occured while updating the details, please try again!'));
        });
    }));
  }

}
