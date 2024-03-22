import { Component, OnInit, OnDestroy, Injector, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { UserService } from 'src/shared/services/user-service/user.service';
import { SubSink } from 'subsink';
import { RouteStateService } from 'src/shared/services/router-service/route-state.service';
import { Router } from '@angular/router';
import { ManagementPortalService } from 'src/shared/services/management-portal-service/management-portal.service';

@Component({
  selector: 'app-group-navbar',
  templateUrl: './group-navbar.component.html',
  styleUrls: ['./group-navbar.component.scss']
})
export class GroupNavbarComponent implements OnInit, OnDestroy {

  @Output() favoriteGroupSaved = new EventEmitter();
  // @Input() groupId: any;
  // @Input() routerFromEvent: any;

  isAdmin: boolean = false;

  routerFromEvent: any;

  // Groups Data
  groupData: any;

  // Is campaign module
  isCampaign: any = false

  // User Data
  userData: any;

  // My Workplace variable check
  myWorkplace: boolean;

  isFavoriteGroup: boolean;

  isIndividualSubscription = false;

  activeState: string;

  // UNSUBSCRIBE THE DATA
  private subSink = new SubSink()

  // NOTIFICATIONS DATA
  public notificationsData: { readNotifications: [], unreadNotifications: [] } = {
    readNotifications: [],
    unreadNotifications: []
  }

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  private userService = this.injector.get(UserService);

  constructor(
    private injector: Injector,
    private utilityService: UtilityService,
    private managementPortalService: ManagementPortalService,
    private routeStateService: RouteStateService,
    private _router: Router,
  ) {
    this.publicFunctions.getCurrentUser().then(user => {
      this.userData = user;
    });

    this.subSink.add(this.routeStateService?.pathParams.subscribe(async (res) => {
      if (res) {
        this.routerFromEvent = res;
        await this.ngOnInit();
      }
    }));

    // Check for all the settings
    this.initiateSettings()

  }

  async ngOnInit() {

    // Fetch the current user
    if (!this.userData) {
      this.userData = await this.publicFunctions.getCurrentUser();
    }

    /*
    window['Appcues'].identify(
      this.userData?._id, // unique, required
      {
        createdAt: this.userData?.created_date,
        role: this.userData?.role,
        firstName: this.userData?.first_name,
        companyName: this.userData?.company_name,
        workSpaceName: this.userData?.workspace_name,
        email: this.userData?.email
      }
    );
    */

    if (this._router.routerState.snapshot.root.queryParamMap.has('postId')) {
      const postId = this._router.routerState.snapshot.root.queryParamMap.get('postId');
      this.groupData = await this.publicFunctions.getGroupDetailsByPostId(postId);
      this.publicFunctions.sendUpdatesToGroupData(this.groupData);
    } else {
      this.groupData = await this.publicFunctions.getCurrentGroupDetails();
    }

    /*
    if (this.groupId) {
      // Fetch current group
      this.groupData = await this.publicFunctions.getGroupDetails(this.groupId);
    } else {
      // is personal group
      this.groupData = await this.publicFunctions.getGroupDetails(this.userData?._private_group?._id || this.userData?._private_group);
    }
    */
    if (!this.utilityService.objectExists(this.groupData)) {
      this.groupData = await this.publicFunctions.getGroupDetails(this.userData?._private_group?._id || this.userData?._private_group);
      this.publicFunctions.sendUpdatesToGroupData(this.groupData);
    }

    if (this.groupData) {
      this.isAdmin = this.isAdminUser();
      this.isCampaign = this.groupData.enabled_campaign
    }

    // My Workplace variable check
    this.myWorkplace = this.publicFunctions.isPersonalNavigation(this.groupData, this.userData);

    this.isFavoriteGroup = this.checkIsFavoriteGroup();

    this.isIndividualSubscription = await this.publicFunctions.checkIsIndividualSubscription();

    if (this.routerFromEvent && this.routerFromEvent?._urlSegment) {
      const segments = this.routerFromEvent?._urlSegment?.children?.primary?.segments;
      this.activeState = segments ? segments[segments.length - 2]?.path + '_' + segments[segments.length - 1]?.path : '';
    }

    this.utilityService.handleActiveStateTopNavBar().subscribe(event => {
      this.activeState = event;
    });
  }

  /**
   * This function unsubscribes all the observables as soon as the component is destroyed
   */
  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

  async changeState(state: string) {
    this.activeState = state;
  }

  isAdminUser() {
    const index = this.groupData._admins.findIndex((admin: any) => admin._id === this.userData?._id);
    return index >= 0;
  }

  /**
    * This function opens up the task content in a new modal, and takes #content in the ng-template inside HTML layout
    * @param content
    */
  async openDetails(content) {

    // Utility Service
    let utilityService = this.injector.get(UtilityService)

    // Open Modal
    utilityService.openModal(content, {});
  }

  checkIsFavoriteGroup() {
    let groupIndex = -1;
    if (this.userData && this.userData.stats && this.userData.stats.favorite_groups) {
      groupIndex = this.userData.stats.favorite_groups.findIndex(group => (group._id || group) == this.groupData?._id);
    }
    return groupIndex >= 0;
  }

  saveFavoriteGroup() {
    // Utility Service
    let utilityService = this.injector.get(UtilityService);

    utilityService.asyncNotification($localize`:@@groupNavbar.pleaseWaitWeAreSaving:Please wait we are saving the information...`,
      new Promise((resolve, reject) => {
        // Call HTTP Request to change the request
        this.userService.saveFavoriteGroup(this.userData._id, this.groupData?._id, !this.isFavoriteGroup)
          .then((res) => {
            this.isFavoriteGroup = !this.isFavoriteGroup;
            this.userData = res['user'];
            this.publicFunctions.sendUpdatesToUserData(this.userData);
            this.favoriteGroupSaved.emit(this.userData);
            resolve(utilityService.resolveAsyncPromise($localize`:@@groupNavbar.groupSavedFavorite:Group saved as favorite!`))
          })
          .catch(() => {
            reject(utilityService.rejectAsyncPromise($localize`:@@groupNavbar.unableToSaveAsFavorite:Unable to save the group as favorite, please try again!`))
          });
      }));
  }

  initiateSettings(){
    // Current Group data
    this.subSink.add(this.utilityService.currentGroupData.subscribe((res) => {
      if (JSON.stringify(res) != JSON.stringify({})) {
        this.groupData = res;
        if (this.groupData) {
          this.isAdmin = this.isAdminUser()
          this.isCampaign = this.groupData.enabled_campaign
        }
      }
    }))
  }
}
