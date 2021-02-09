import { Component, Inject,EventEmitter ,Output,Injector, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { environment } from 'src/environments/environment';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { UserService } from "src/shared/services/user-service/user.service";
import moment from 'moment/moment';
@Component({
  selector: 'app-user-update-user-personal-information-dialog',
  templateUrl: './user-update-user-personal-information-dialog.component.html',
  styleUrls: ['./user-update-user-personal-information-dialog.component.scss']
})
export class UserUpdateUserPersonalInformationDialogComponent implements OnInit {
  
  // Public functions class member
  // Close Event Emitter - Emits when closing dialog
  @Output() closeEvent = new EventEmitter();
  publicFunctions = new PublicFunctions(this.injector);
  userData: any;
  postion: string;
  joinDate: string;
  bio:string;
  // Is current user component
  isCurrentUser: boolean = false;

  constructor( 
    @Inject(MAT_DIALOG_DATA) public data: any,
    private injector: Injector,
    private utilityService: UtilityService,
    private userService: UserService,
    private mdDialogRef: MatDialogRef<UserUpdateUserPersonalInformationDialogComponent>
  ) { }

  ngOnInit(): void {
    this.userData = this.data.userData;
    this.postion = this.userData?.current_position || '';
    this.joinDate = moment(this.userData?.company_join_date).format("YYYY-MM-DD");
    this.bio = this.userData?.bio || '';
  }

  updateInfo() {
    const data ={
      current_position:this.postion,
      company_join_date:this.joinDate,
      bio:this.bio
    }
    this.utilityService.asyncNotification('Please wait we are updating your information...', new Promise((resolve, reject) => {
      this.publicFunctions.userDetailsServiceFunction(this.userService,data)
        .then((res) => {
          
          this.closeEvent.emit(res);
          this.mdDialogRef.close();

          resolve(this.utilityService.resolveAsyncPromise('Details updated sucessfully!'));
        }).catch((err) => {
          reject(this.utilityService.rejectAsyncPromise('An unexpected occured while updating the details, please try again!'));
        });
    }));    
  }

}
