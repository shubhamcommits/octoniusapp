import { Component, OnInit, OnDestroy, Injector, Input, EventEmitter, Output, OnChanges } from '@angular/core';
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

@Component({
  selector: 'app-icons-sidebar',
  templateUrl: './icons-sidebar.component.html',
  styleUrls: ['./icons-sidebar.component.scss']
})
export class IconsSidebarComponent implements OnInit, OnDestroy {

  constructor(
    private injector: Injector,
    private storageService: StorageService,
    private authService: AuthService,
    private socketService: SocketService,
    private userService: UserService,
    private router: Router
  ) { }

  @Input() sideNav: MatSidenav;
  @Input() iconsSidebar = false;
  @Input() userGroups = [];
  @Output() sidebarChange = new EventEmitter();

  // CURRENT USER DATA
  userData: any;

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

  async ngOnInit() {
    // FETCH THE USER DETAILS
    this.userData = await this.publicFunctions.getCurrentUser();

    // Fetch the current workspace data
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
  }

  /**
   * This functions unsubscribes all the observables subscription to avoid memory leak
   */
  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

  /**
   * This function is responsible for logging the user out
   */
  async logout() {
    try {
      this.utilityService.asyncNotification($localize`:@@iconsSidebar.pleaseWaitWhileWeLogYouOut:Please wait, while we log you out securely...`,
        new Promise((resolve, reject) => {
          this.authService.signout().toPromise()
            .then((res) => {
              this.storageService.clear();
              this.publicFunctions.sendUpdatesToGroupData({})
              this.publicFunctions.sendUpdatesToRouterState({})
              this.publicFunctions.sendUpdatesToUserData({})
              this.publicFunctions.sendUpdatesToAccountData({})
              this.publicFunctions.sendUpdatesToWorkspaceData({})
              this.socketService.disconnectSocket();
              this.router.navigate(['/home'])
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@iconsSidebar.successfullyLoggedOut:Successfully Logged out!`));
            }).catch((err) => {
              console.log('Error occurred while logging out!', err);
              reject(this.utilityService.rejectAsyncPromise($localize`:@@iconsSidebar.errorLoggingOut:Error occurred while logging you out!, please try again!`));
            });
        }));
    } catch (err) {
      console.log('Error occurred while logging out!', err);
      this.utilityService.errorNotification($localize`:@@iconsSidebar.errorLoggingOut:Error occurred while logging you out!`);
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
}
