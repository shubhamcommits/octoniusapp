import { Component, SimpleChanges, OnInit, OnChanges, Injector, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PublicFunctions } from 'modules/public.functions';
import { ActivatedRoute, NavigationEnd, Router, RouterEvent, ChildActivationEnd, RouteConfigLoadEnd } from '@angular/router';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { UserService } from 'src/shared/services/user-service/user.service';

@Component({
  selector: 'app-group-navbar',
  templateUrl: './group-navbar.component.html',
  styleUrls: ['./group-navbar.component.scss']
})
export class GroupNavbarComponent implements OnInit, OnChanges{

  constructor(
    private injector: Injector,
    private router: ActivatedRoute,
    private _router: Router
  ) {
    this.publicFunctions.getCurrentUser().then(user => {
      this.userData = user;
    });
  }

  @Output() favoriteGroupSaved = new EventEmitter();
  @Input() groupId: any;
  @Input() routerFromEvent: any;

  isAdmin: boolean = false;

  // baseUrl for uploads
  baseUrl = environment.UTILITIES_GROUPS_UPLOADS

  // baseUrl for users
  userBaseUrl = environment.UTILITIES_USERS_UPLOADS;

  // Groups Data
  groupData: any;

  // User Data
  userData: any;

  // My Workplace variable check
  myWorkplace: boolean;

  isFavoriteGroup: boolean;

  // PUBLIC FUNCTIONS
  private publicFunctions = new PublicFunctions(this.injector);

  private userService = this.injector.get(UserService);

  async ngOnInit() {

    // Fetch the current user
    if (!this.userData) {
      this.userData = await this.publicFunctions.getCurrentUser();
    }

    if (this.groupId) {
      // Fetch current group
      this.groupData = await this.publicFunctions.getCurrentGroupDetails(this.groupId);
    }
    
    if (this.groupData) {
      this.isAdmin = this.isAdminUser();

      this.userService.increaseGroupVisit(this.userData._id, this.groupId || this.groupData._id).then(res => {
        this.publicFunctions.sendUpdatesToUserData(res['user']);
      });
    }

    // My Workplace variable check
    this.myWorkplace = this.isPersonalNavigation();

    this.isFavoriteGroup = this.checkIsFavoriteGroup();
  }

  ngOnChanges(changes: SimpleChanges) {
    
    for (const propName in changes) {
      const change = changes[propName];
      const to = change.currentValue;
      const from = change.previousValue;
      if (propName === 'groupId') {
        this.groupId = to;
        this.ngOnInit();
      }
      if (propName === 'routerFromEvent') {
        this.routerFromEvent = to;
        
      }
    }
  }

  isAdminUser() {
    const index = this.groupData._admins.findIndex((admin: any) => admin._id === this.userData._id);
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
    utilityService.openModal(content, {
      size: 'xl',
      centered: true
    });
  }

  isPersonalNavigation() {
    return (this.groupId)
      ? this.groupData.group_name==='personal'
        ? (this.groupData?._id == this.userData._private_group)
          ? true : false
        :false
      :true;
  }

  checkIsFavoriteGroup() {
    let groupIndex = -1;
    if (this.userData && this.userData.stats && this.userData.stats.favorite_groups) {
      groupIndex = this.userData.stats.favorite_groups.findIndex(group => (group._id || group) == this.groupId);
    }
    return groupIndex >= 0;
  }

  saveFavoriteGroup() {
    // Utility Service
    let utilityService = this.injector.get(UtilityService);

    utilityService.asyncNotification('Please wait we are saving the information...',
      new Promise((resolve, reject) => {
        // Call HTTP Request to change the request
        this.userService.saveFavoriteGroup(this.userData._id, this.groupId, !this.isFavoriteGroup)
          .then((res) => {
            this.isFavoriteGroup = !this.isFavoriteGroup;
            this.userData = res['user'];
            this.publicFunctions.sendUpdatesToUserData(this.userData);
            this.favoriteGroupSaved.emit(this.userData);
            resolve(utilityService.resolveAsyncPromise(`Group saved as favorite!`))
          })
          .catch(() => {
            reject(utilityService.rejectAsyncPromise(`Unable to save the group as favorite, please try again!`))
          });
      }));
  }
}
