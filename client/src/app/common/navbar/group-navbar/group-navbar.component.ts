import { Component, OnInit, Injector, OnDestroy } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PublicFunctions } from 'modules/public.functions';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';
import { UserService } from 'src/shared/services/user-service/user.service';

@Component({
  selector: 'app-group-navbar',
  templateUrl: './group-navbar.component.html',
  styleUrls: ['./group-navbar.component.scss']
})
export class GroupNavbarComponent implements OnInit, OnDestroy {


  constructor(
    private injector: Injector,
    private router: ActivatedRoute,
    private _router: Router
  ) {
    this.subSink.add(this._router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        this.ngOnInit()
      }
    }))
  }

  isAdmin: boolean = false;

  // UNSUBSCRIBE THE DATA
  private subSink = new SubSink();

  // baseUrl for uploads
  baseUrl = environment.UTILITIES_GROUPS_UPLOADS

  // baseUrl for users
  userBaseUrl = environment.UTILITIES_USERS_UPLOADS;

  // Groups Data
  groupData: any;

  // User Data
  userData: any;

  // Fetch groupId from router snapshot
  groupId = this.router.snapshot.queryParamMap.get('group');

  // My Workplace variable check
  myWorkplace: boolean = this.isPersonalNavigation();

  // PUBLIC FUNCTIONS
  private publicFunctions = new PublicFunctions(this.injector);

  private userService = this.injector.get(UserService);

  async ngOnInit() {

    // Fetch groupId from router snapshot
    this.groupId = this.router.snapshot.queryParamMap.get('group');

    // Fetch the group data from HTTP Request
    if(this.groupId)
      this.groupData = await this.publicFunctions.getGroupDetails(this.groupId)

    // Fetch the current user
    this.userData = await this.publicFunctions.getCurrentUser();

    if (this.groupData) {
      // Send the updates of the groupdata through shared service
      this.publicFunctions.sendUpdatesToGroupData(this.groupData)
    }

    console.log('Group Data', this.groupData)
    if (this.groupData) {
      this.isAdmin = this.isAdminUser();

      if (this.groupId) {
        this.userService.increaseGroupVisit(this.userData._id, this.groupId).then(res => {
          this.publicFunctions.sendUpdatesToUserData(res['user']);
        });
      }
    }

    // My Workplace variable check
    this.myWorkplace = this.isPersonalNavigation();
  }

  /**
   * This functions unsubscribes all the observables subscription to avoid memory leak
   */
  ngOnDestroy(): void {
    this.subSink.unsubscribe();
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
    return this.router.snapshot.queryParamMap.has('myWorkplace')
      ? (this.router.snapshot.queryParamMap.get('myWorkplace') == ('false') ? (false) : (true))
      : (this.router.snapshot['_routerState'].url.toLowerCase().includes('myspace')
          ? true
          : false)
  }
}
