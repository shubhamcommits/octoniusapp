import { Component, Injector, OnInit, OnDestroy, Input} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { WorkplaceLdapFieldsMapperDialogComponent } from 'modules/admin/admin-general/workplace-integrations/workplace-ldap-fields-mapper-dialog/workplace-ldap-fields-mapper-dialog.component';
import { PublicFunctions } from 'modules/public.functions';
import { AuthService } from 'src/shared/services/auth-service/auth.service';
import { RouteStateService } from 'src/shared/services/router-service/route-state.service';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { SubSink } from 'subsink';
import { UserUpdateProfileDialogComponent } from '../../shared/user-update-profile-dialog/user-update-profile-dialog.component';
import { UserUpdateUserPersonalInformationDialogComponent } from '../../shared/user-update-user-personal-information-dialog/user-update-user-personal-information-dialog.component';

@Component({
  selector: 'app-user-account-navbar',
  templateUrl: './user-account-navbar.component.html',
  styleUrls: ['./user-account-navbar.component.scss']
})
export class UserAccountNavbarComponent implements OnInit, OnDestroy {

  // User Data
  userData: any;

  routerFromEvent: any;

  // WORKSPACE DATA
  workspaceData: any;

  activeState:string;

  // Is current user component
  isCurrentUser: boolean = true;

  isOrganizationModuleAvailable = false;

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector)

  // SUBSINK
  private subSink = new SubSink();

  constructor(
    private injector: Injector,
    private router: Router,
    private routeStateService : RouteStateService,
    private dialog: MatDialog,
    private utilityService: UtilityService,
    private workspaceService: WorkspaceService,
    private userService: UserService,
    private authService: AuthService,
    private storageService: StorageService
  ) {

    this.subSink.add(this.routeStateService?.pathParams.subscribe(async (res) => {
      if(res){
        this.routerFromEvent = res;
        await this.ngOnInit();
      }
    }));
  }

  async ngOnInit() {
    await this.publicFunctions.getCurrentUser().then(user => this.userData = user);

    this.isOrganizationModuleAvailable = await this.publicFunctions.isOrganizationModuleAvailable();

    // Subscribe to the change in workspace data from the socket server
    this.subSink.add(this.utilityService.currentWorkplaceData.subscribe((res) => {
      if (JSON.stringify(res) != JSON.stringify({})) {
        this.workspaceData = res;
      }
    }));

    if(this.routerFromEvent && this.routerFromEvent._urlSegment){
      const segments = this.routerFromEvent?._urlSegment?.children?.primary?.segments;
      this.activeState = segments? segments[segments.length-1].path: '';
    }

    this.utilityService.handleActiveStateTopNavBar().subscribe(event => {
      this.activeState = event;
    });
  }

  async changeState(state:string){
    this.activeState = state;
  }

  /**
   * This functions unsubscribes all the observables subscription to avoid memory leak
   */
  ngOnDestroy(): void {
    this.subSink.unsubscribe()
  }

  /**
   * This function is responsible for opening a dialog to update User professional Information
   */
  openUpdateModel() {
    const data = {
        userData: this.userData,
    };

    const dialogRef = this.dialog.open(UserUpdateUserPersonalInformationDialogComponent, {
      width: '460px',
      hasBackdrop: true,
      data: data
    });
    
    const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe((data) => {
      this.userData = data;

      this.publicFunctions.sendUpdatesToUserData(this.userData);
    });
    dialogRef.afterClosed().subscribe(result => {
      closeEventSubs.unsubscribe();
    });
  }

  async getUserInformation() {
    this.utilityService.updateIsLoadingSpinnerSource(true);

    const accountData = await this.publicFunctions.getCurrentAccount();
    this.workspaceService.ldapUserInfoProperties(this.workspaceData._id, accountData?.email, false).then(res => {
      if (this.utilityService.objectExists(res['userLdapData'])) {
        this.openLDAPFieldsMapDialog(res['userLdapData']);
      } else {
        this.utilityService.errorNotification($localize`:@@userProfile.userNoExists:Your user doesn't exists in LDAP!`);
      }
      //setTimeout(() => {
      this.utilityService.updateIsLoadingSpinnerSource(false);
      //}, 10000);
    }).catch(error => {
      this.utilityService.updateIsLoadingSpinnerSource(false);
    });
  }

  openLDAPFieldsMapDialog(userLdapData: any) {
    const data = {
      ldapPropertiesNames: Object.keys(userLdapData),
      isGlobal: false,
      userLdapData: userLdapData
    }
    const dialogRef = this.dialog.open(WorkplaceLdapFieldsMapperDialogComponent, {
      width: '65%',
      height: '85%',
      disableClose: true,
      hasBackdrop: true,
      data: data
    });

    const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe(async (data) => {
      this.userData = await this.publicFunctions.getCurrentUser();
    });

    dialogRef.afterClosed().subscribe(async result => {
      closeEventSubs.unsubscribe();
    });
  }
  
  /**
   * This function is responsible for opening a dialog to update User password.
   */
  openUpdatePasswordModal(){
    const data = {
      userData: this.userData,
    };

    this.dialog.open(UserUpdateProfileDialogComponent, {
      width: '460px',
      // height: '80%',
      hasBackdrop: true,
      data: data
    });
  }

  /**
    * This function opens up the task content in a new modal, and takes #content in the ng-template inside HTML layout
    * @param content
    */
   async openDetails(content) {
    this.utilityService.openModal(content, {});
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
}
