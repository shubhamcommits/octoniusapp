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
  @Input() userGroups: any = [];
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
      this.utilityService.asyncNotification('Please wait, while we log you out securely...',
        new Promise((resolve, reject) => {
          this.authService.signout().toPromise()
            .then((res) => {
              this.storageService.clear();
              this.publicFunctions.sendUpdatesToGroupData({})
              this.publicFunctions.sendUpdatesToRouterState({})
              this.publicFunctions.sendUpdatesToUserData({})
              this.publicFunctions.sendUpdatesToAccountData({})
              this.publicFunctions.sendUpdatesToWorkspaceData({})
              // this.socketService.clear();
              this.router.navigate(['/home'])
              resolve(this.utilityService.resolveAsyncPromise('Successfully Logged out!'));
            }).catch((err) => {
              console.log('Error occurred while logging out!', err);
              reject(this.utilityService.rejectAsyncPromise('Error occurred while logging you out!, please try again!'));
            });
        }));
    } catch (err) {
      console.log('Error occurred while logging out!', err);
      this.utilityService.errorNotification('Error occurred while logging you out!');
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
