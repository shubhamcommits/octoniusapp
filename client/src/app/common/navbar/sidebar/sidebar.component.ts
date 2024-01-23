import { Component, OnInit, OnDestroy, Injector,SimpleChanges,Input, EventEmitter, Output, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { AuthService } from 'src/shared/services/auth-service/auth.service';
import { SocketService } from 'src/shared/services/socket-service/socket.service';
import { SubSink } from 'subsink';
import { MatSidenav } from '@angular/material/sidenav';
import { UserService } from 'src/shared/services/user-service/user.service';
import { ManagementPortalService } from 'src/shared/services/management-portal-service/management-portal.service';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { PortfolioService } from 'src/shared/services/portfolio-service/portfolio.service';
import { LibraryService } from 'src/shared/services/library-service/library.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy, OnChanges {

  @Input() sideNav: MatSidenav;
  @Input() iconsSidebar = false;
  @Input() userGroups: any = [];
  @Input() userPortfolios: any = [];
  @Input() isMobile = false;
  @Input() isIndividualSubscription = false;

  @Output() sidebarChange = new EventEmitter();

  // CURRENT USER DATA
  userData: any = {};
  accountData: any = {};
  userWorkspaces = [];

  isExpanded = false;

  totalNotifications = 0;

  userCollections: any = [];

  // userGroupsAndPortfoliosAndCollections = [];

  // Workspace data for the current workspace
  public workspaceData: any = {};

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector);

  // UNSUBSCRIBE THE DATA
  private subSink = new SubSink();

  // Utility Service
  public utilityService = this.injector.get(UtilityService);

  constructor(
    private socketService:SocketService,
    private storageService: StorageService,
    private authService: AuthService,
    private userService: UserService,
    private groupService: GroupService,
    private portfolioService: PortfolioService,
    private libraryService: LibraryService,
    private managementPortalService: ManagementPortalService,
    private injector: Injector,
    private router: Router,
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
        await this.mapGroupsAndPortfoliosAndCollections();
      }

      if (propName === 'userPortfolios') {
        this.userPortfolios = to;
        await this.mapGroupsAndPortfoliosAndCollections();
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

    await this.getUserWorkspaces();

    if (!this.isIndividualSubscription) {
      this.userGroups = this.userData['stats']['favorite_groups'];
      this.userPortfolios = this.userData['stats']['favorite_portfolios'];
      this.userCollections = this.userData['stats']['favorite_collections'];

      await this.mapGroupsAndPortfoliosAndCollections();
    } else {
      this.groupService.getGlobalGroupData().then((res: any) => {
        const group = res['group'];
        this.userGroups = [{
          _id: group._id,
          name: $localize`:@@sidebar.workspace:Workspace`,
          avatar: group.group_avatar,
          type: 'group'
        }];
      });
    }
  }

  async mapGroupsAndPortfoliosAndCollections() {
    // Sometimes the favorites are not populated
    for (let i = 0; i < this.userGroups.length; i++) {
      if (!this.userGroups[i]?._id) {
        await this.groupService.getGroup(this.userGroups[i]).then(res => {
          this.userGroups[i] = res['group'];
        });
      }
    }
    // Sometimes the favorites are not populated
    for (let i = 0; i < this.userPortfolios.length; i++) {
      if (!this.userPortfolios[i]?._id) {
        await this.portfolioService.getPortfolio(this.userPortfolios[i]).then(res => {
          this.userPortfolios[i] = res['portfolio'];
        });
      }
    }
    // Sometimes the favorites are not populated
    for (let i = 0; i < this.userCollections.length; i++) {
      if (!this.userCollections[i]?._id) {
        await this.libraryService.getCollection(this.userCollections[i]).then(res => {
          this.userCollections[i] = res['collection'];
        });
      }
    }

    this.sortElements();
  }

  sortElements() {
    this.userGroups = this.userGroups?.sort((t1, t2) => {
      const name1 = t1?.group_name?.toLowerCase() || t1?.group_name;
      const name2 = t2?.group_name?.toLowerCase() || t2?.group_name;
      if (name1 > name2) { return 1; }
      if (name1 < name2) { return -1; }
      return 0;
    });

    this.userPortfolios = this.userPortfolios?.sort((t1, t2) => {
      const name1 = t1?.portfolio_name?.toLowerCase() || t1?.portfolio_name;
      const name2 = t2?.portfolio_name?.toLowerCase() || t2?.portfolio_name;
      if (name1 > name2) { return 1; }
      if (name1 < name2) { return -1; }
      return 0;
    });

    this.userCollections = this.userCollections?.sort((t1, t2) => {
        const name1 = t1?.name?.toLowerCase() || t1?.name;
        const name2 = t2?.name?.toLowerCase() || t2?.name;
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
            .then(async (res) => {
              await this.clearUserData();
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

  async goToGroup(group: any) {
    this.changeState('groups_activity');
    const newGroup = await this.publicFunctions.getGroupDetails(group?._id);
    await this.publicFunctions.sendUpdatesToGroupData(newGroup);
    await this.publicFunctions.sendUpdatesToPortfolioData({});
    this.router.navigate(['/dashboard', 'work', 'groups', 'activity']);
  }

  async goToPortfolio(group: any) {
    this.changeState('portfolio');
    const newPortfolio = await this.publicFunctions.getPortfolioDetails(group?._id);
    await this.publicFunctions.sendUpdatesToPortfolioData(newPortfolio);
    await this.publicFunctions.sendUpdatesToGroupData({});
    this.router.navigate(['/dashboard', 'work', 'groups', 'portfolio']);
  }

  async goToCollection(group: any) {
    this.router.navigate(['/dashboard', 'work', 'groups', 'library', 'collection'], {queryParams: { collection: group?._id }});
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

  async changeState(state:string){
    this.utilityService.handleActiveStateTopNavBar().emit(state);
  }

  async changeToPersonalGroup() {
    await this.publicFunctions.sendUpdatesToGroupData({});
    this.router.navigate(['/dashboard', 'myspace', 'inbox']);
  }

  async getUserWorkspaces() {
    await this.userService.getUserWorkspaces(this.userData?._id).then((res: any) => {
      this.totalNotifications = res['workspaces'].map(w => w.numNotifications).reduce((a, b) => { return a + b; });
      this.userWorkspaces = res['workspaces'].filter(workspace => (workspace._id || workspace) != this.workspaceData?._id);
      const index = (res['workspaces']) ? res['workspaces'].findIndex(workspace => (workspace._id || workspace) == this.workspaceData?._id) : -1;
      if (index >= 0){
        this.workspaceData.numNotifications = res['workspaces'][index].numNotifications;
      }
    }).catch(err => {
      this.userWorkspaces = [];
    });
  }

  toggleCollapsed() {
    this.isExpanded = !this.isExpanded;
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
          await this.storeUserData(res);
          await this.initProperties();

          let workspaceBlocked = false;
          await this.managementPortalService.getBillingStatus(workspaceId, this.workspaceData?.management_private_api_key).then(res => {
            if (res['blocked'] ) {
              workspaceBlocked = res['blocked'];
            }
          }).catch((err) => {
            this.authService.signout().subscribe(async (res) => {
              this.clearUserData();
              this.socketService.disconnectSocket();
              this.router.navigate(['/home']);
            });
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
            setTimeout(async () => {
              this.socketService.serverInit();
              await this.getUserWorkspaces();
              const navbar = document.getElementById('pageWorkspacesSubmenu');
              navbar?.classList.remove('show');
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@sidebar.hi:Hi ${res['user']['first_name']}, welcome back to your workplace!`));
              this.router.navigate(['/home']);
            }, 500);
          }

          window.location.reload();
        }, (err) => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@sidebar.oopsErrorSigningIn:Oops some error occurred while signing you in, please try again!`))
      }));
    });
  }

  /**
   * This function clear the user related data in the browser
   */
  clearUserData() {
    this.storageService.clear();
    this.publicFunctions.sendUpdatesToGroupData({});
    this.publicFunctions.sendUpdatesToRouterState({});
    this.publicFunctions.sendUpdatesToUserData({});
    this.publicFunctions.sendUpdatesToAccountData({});
    this.publicFunctions.sendUpdatesToWorkspaceData({});
    this.managementPortalService.sendUpdatesToStripeSubscription({});
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
