import { Component, OnInit, Input, ChangeDetectionStrategy, Injector,Output, EventEmitter} from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';
import { UserService } from "src/shared/services/user-service/user.service";
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { AuthService } from 'src/shared/services/auth-service/auth.service';
import { Router } from '@angular/router';
import { UserUpdateUserInformationDialogComponent } from 'src/app/common/shared/user-update-user-information-dialog/user-update-user-information-dialog.component';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-user-information',
  templateUrl: './user-information.component.html',
  styleUrls: ['./user-information.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserInformationComponent implements OnInit {

  constructor(
    private utilityService: UtilityService,
    private storageService: StorageService,
    private authService: AuthService,
    private userService:UserService,
    private injector: Injector,
    private router: Router,
    private dialog: MatDialog
    ) { }

  // User Data Object
  @Input('userData') userData: any = {};

  // Is current user variable
  @Input('currentUser') currentUser: boolean = false;

  // Emitter to notify that the sorting type is changing
  @Output() updateData: EventEmitter<Object> = new EventEmitter<Object>();

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);


  ngOnInit() {
  }
  
  async removeUser(userID: string){

    // Ask User to remove this user from the group or not
    this.utilityService.getConfirmDialogAlert($localize`:@@userInformation.areYouSure:Are you sure?`,
        $localize`:@@userInformation.thisActionWillDeleteAccount:This action will delete your account.`)
      .then((result) => {
        if (result.value) {
          // Delete the User
          this.utilityService.asyncNotification($localize`:@@userInformation.pleaseWaitWeDeleteUser:Please wait while we are Deleting the user ...`,
            new Promise((resolve, reject) => {
              this.userService.removeUser(userID)
              .then(res => {
                  if(res){
                    this.authService.signout().toPromise()
                    .then((res) => {
                      this.storageService.clear();
                      this.publicFunctions.sendUpdatesToGroupData({})
                      this.publicFunctions.sendUpdatesToRouterState({})
                      this.publicFunctions.sendUpdatesToUserData({})
                      this.publicFunctions.sendUpdatesToWorkspaceData({})
                      this.router.navigate(['/home'])
                      resolve(this.utilityService.resolveAsyncPromise($localize`:@@userInformation.successfullyLoggedOut:Successfully Logged out!`));
                    }).catch((err) => {
                      console.log('Error occurred while logging out!', err);
                      reject(this.utilityService.rejectAsyncPromise($localize`:@@userInformation.errorOccurredWhileLogginOut:Error occurred while logging you out!, please try again!`));
                    });
                  }
                  // Resolve with success
                  resolve(this.utilityService.resolveAsyncPromise($localize`:@@userInformation.userDeleted:User Deleted!`))
                })
                .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@userInformation.unableToRemoveUser:Unable to remove the user from the workplace, please try again!`)))
            }))
        }
      })
  }

  /**
   * This function is responsible for opening a dialog to update User Profile Information
   */
  openUpdateModel() {
    const data = {
      userData: this.userData,
    };

    const dialogRef = this.dialog.open(UserUpdateUserInformationDialogComponent, {
      width: '460px',
      hasBackdrop: true,
      data: data
    });

    const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe((data) => {
      this.updateData.emit(data);
    });
    dialogRef.afterClosed().subscribe(result => {
      closeEventSubs.unsubscribe();
    });
  }

}
