import { Component, OnInit, OnDestroy, Injector,SimpleChanges,Input, EventEmitter, Output, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { environment } from 'src/environments/environment';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { AuthService } from 'src/shared/services/auth-service/auth.service';
import { SocketService } from 'src/shared/services/socket-service/socket.service';
import { SubSink } from 'subsink';
import { MatSidenav } from '@angular/material/sidenav';
import { UserService } from 'src/shared/services/user-service/user.service';
import { ManagementPortalService } from 'src/shared/services/management-portal-service/management-portal.service';
import Swal from 'sweetalert2';
// import { retry } from 'rxjs/internal/operators/retry';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {

  @Input() sideNav: MatSidenav;
  @Input() iconsSidebar = false;
  @Input() userGroups: any = [];
  @Input() isMobile = false;
  @Output() sidebarChange = new EventEmitter();

  // CURRENT USER DATA
  userData: any = {};

  accountData: any = {};
  userWorkspaces = [];

  // Workspace data for the current workspace
  public workspaceData: any = {};

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector);

  // Users Base Url
  userBaseUrl = environment.UTILITIES_USERS_UPLOADS;

  // Group Base Url
  groupBaseUrl = environment.UTILITIES_GROUPS_UPLOADS;

  // UNSUBSCRIBE THE DATA
  private subSink = new SubSink();

  // Utility Service
  public utilityService = this.injector.get(UtilityService);

  constructor(
    private injector: Injector,
    private storageService: StorageService,
    private authService: AuthService,
    private userService: UserService,
    private managementPortalService: ManagementPortalService,
    private socketService:SocketService,
    private router: Router
  ) { }

  async ngOnInit() {
    await this.initProperties();
  }

  async ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      const change = changes[propName];
      const to = change.currentValue;
      if (propName === 'userGroups') {
        this.userGroups = to;
        await this.sort();
      }
    }
  }

  /**
   * This functions unsubscribes all the observables subscription to avoid memory leak
   */
  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

  async initProperties() {
    this.userData = await this.publicFunctions.getCurrentUser();
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    this.accountData = await this.publicFunctions.getCurrentAccount();
    this.userWorkspaces = await this.getUserWorkspaces();
  }

  async sort() {
    this.userGroups.sort((t1, t2) => {
      const name1 = t1?.group_name.toLowerCase();
      const name2 = t2?.group_name.toLowerCase();
      if (name1 > name2) { return 1; }
      if (name1 < name2) { return -1; }
      return 0;
    });
  }

  /**
   * This function is responsible for logging the user out
   */
  async logout() {
    try {
      this.utilityService.asyncNotification($localize`:@@sidebar.pleaseWaitWhileLogOut:Please wait, while we log you out securely...`,
        new Promise((resolve, reject) => {
          this.authService.signout().toPromise()
            .then((res) => {
              this.storageService.clear();
              this.publicFunctions.sendUpdatesToRouterState({});
              this.publicFunctions.sendUpdatesToGroupData({});
              this.publicFunctions.sendUpdatesToUserData({});
              this.publicFunctions.sendUpdatesToAccountData({});
              this.publicFunctions.sendUpdatesToWorkspaceData({});
              this.socketService.disconnectSocket();
              this.router.navigate(['/']);
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@sidebar.successfullyLogOut:Successfully Logged out!`));
            }).catch((err) => {
              console.log('Error occurred while logging out!', err);
              reject(this.utilityService.rejectAsyncPromise($localize`:@@sidebar.errorWhileLogOut:Error occurred while logging you out!, please try again!`));
            });
        }));
    } catch (err) {
      console.log('Error occurred while logging out!', err);
      this.utilityService.errorNotification($localize`:@@sidebar.errorWhileLogOut:Error occurred while logging you out!, please try again!`);
    }
  }

  switchSideBar() {
    this.userService.saveIconSidebarByDefault(this.userData._id, !this.iconsSidebar)
      .then((res) => {
        this.userData = res['user'];
        this.publicFunctions.sendUpdatesToUserData(this.userData);
      });

    this.iconsSidebar = !this.iconsSidebar;
    this.sidebarChange.emit();
  }

  async goToGroup(groupId: string, state: string) {
    this.changeState(state);
    const newGroup = await this.publicFunctions.getGroupDetails(groupId);
    this.publicFunctions.sendUpdatesToGroupData(newGroup);
    this.router.navigate(['/dashboard', 'work', 'groups', 'activity']);
  }

  async changeState(state:string){
    this.utilityService.handleActiveStateTopNavBar().emit(state);
  }

  changeToPersonalGroup() {
    this.publicFunctions.sendUpdatesToGroupData({});
    this.router.navigate(['/dashboard', 'myspace', 'inbox']);
  }

  getUserWorkspaces() {
    return this.accountData._workspaces.filter(workspace => (workspace._id || workspace) != this.workspaceData?._id);
  }

  goToWorkspace(workspaceId: string) {
    try {
      this.utilityService.asyncNotification($localize`:@@sidebar.pleaseWaitSignYouIn:Please wait while we sign you in...`,
        this.selectWorkspaceServiceFunction(this.accountData._id, workspaceId));
    } catch (err) {
      console.log('There\'s some unexpected error occurred, please try again later!', err);
      this.utilityService.errorNotification($localize`:@@sidebar.unexpectedError:There\'s some unexpected error occurred, please try again later!`);
    }
  }

  /**
   * This implements the service function for @function selectWorkspace(userData)
   * @param userData
   */
  selectWorkspaceServiceFunction(accountId: string, workspaceId: string) {
    return new Promise(async (resolve, reject) => {
      this.subSink.add(this.authService.selectWorkspace(accountId, workspaceId)
        .subscribe(async (res) => {
          await this.clearUserData();
          this.publicFunctions.sendUpdatesToUserData({});
          await this.storeUserData(res);

          await this.initProperties();
          await this.sort();

          this.userGroups = this.userData['stats']['favorite_groups'];
          const workspaceData = await this.publicFunctions.getCurrentWorkspace();

          let workspaceBlocked = false;
          await this.managementPortalService.getBillingStatus(workspaceId, workspaceData['management_private_api_key']).then(res => {
            if (res['blocked'] ) {
              workspaceBlocked = res['blocked'];
            }
          });

          if (workspaceBlocked) {
            this.utilityService.workplaceBlockedNotification($localize`:@@sidebar.workspaceIsNotAvailable:Your workspace is not available, please contact your administrator!`).then(res => {
              if (res.dismiss === Swal.DismissReason.close) {
                this.authService.signout().subscribe((res) => {
                  this.clearUserData();
                  this.socketService.disconnectSocket();
                  this.router.navigate(['/home']);
                });
              }
            });
          } else {
            //if query parms exist redirect to teams permission page else normal flow
            // note:- Code is for teams auth popup not for octonius app and only work in that case.
            setTimeout(async () => {
              this.socketService.serverInit();
              this.userWorkspaces = await this.getUserWorkspaces();
              this.router.navigate(['dashboard', 'myspace', 'inbox'])
                .then(() => {
                  resolve(this.utilityService.resolveAsyncPromise($localize`:@@sidebar.hi:Hi ${res['user']['first_name']}, welcome back to your workplace!`));
                })
                .catch((err) => {
                  this.storageService.clear();
                  reject(this.utilityService.rejectAsyncPromise($localize`:@@sidebar.oopsErrorSigningIn:Oops some error occurred while signing you in, please try again!`))
                });
            }, 500);
          }
        }, (err) => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@sidebar.oopsErrorSigningIn:Oops some error occurred while signing you in, please try again!`))
      }));
    });
  }

  /**
   * This function clear the user related data in the browser
   * @param res
   */
  clearUserData() {
    this.storageService.clear();
    this.publicFunctions.sendUpdatesToGroupData({});
    this.publicFunctions.sendUpdatesToRouterState({});
    this.publicFunctions.sendUpdatesToUserData({});
    this.publicFunctions.sendUpdatesToWorkspaceData({});
  }

  /**
   * This function stores the user related data and token for future reference in the browser
   * @param res
   */
  storeUserData(res: Object) {
    this.publicFunctions.sendUpdatesToUserData(res['user']);
    this.storageService.setLocalData('authToken', JSON.stringify(res['token']));
  }
}
