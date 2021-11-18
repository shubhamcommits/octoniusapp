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

  constructor(
    private injector: Injector,
    private storageService: StorageService,
    private authService: AuthService,
    private userService: UserService,
    private socketService:SocketService,
    private router: Router
  ) { }

  async ngOnInit() {
    // FETCH THE USER DETAILS
    this.userData = await this.publicFunctions.getCurrentUser();
    // Fetch the current workspace data
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
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

  async sort(){
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
              this.publicFunctions.sendUpdatesToRouterState({})
              this.publicFunctions.sendUpdatesToGroupData({})
              this.publicFunctions.sendUpdatesToUserData({})
              this.publicFunctions.sendUpdatesToAccountData({})
              this.publicFunctions.sendUpdatesToWorkspaceData({})
              this.socketService.disconnectSocket();
              this.router.navigate(['/'])
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

  async changeState(state:string){
    this.utilityService.handleActiveStateTopNavBar().emit(state);
  }

}
