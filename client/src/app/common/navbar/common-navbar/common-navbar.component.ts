import { Component, OnInit, Injector ,Input, OnDestroy} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { environment } from 'src/environments/environment';
import { ManagementPortalService } from 'src/shared/services/management-portal-service/management-portal.service';
import { RouteStateService } from 'src/shared/services/router-service/route-state.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-common-navbar',
  templateUrl: './common-navbar.component.html',
  styleUrls: ['./common-navbar.component.scss']
})
export class CommonNavbarComponent implements OnInit, OnDestroy {

  // BASE URL OF THE APPLICATION
  baseUrl = environment.UTILITIES_WORKSPACES_UPLOADS;
  userBaseUrl = environment.UTILITIES_USERS_UPLOADS;

  routerFromEvent: any;
  activeState:string;
  // SUBSINK
  private subSink = new SubSink();

  isCurrentUser: boolean = false;

  // User Data
  userData: any;

  // WORKSPACE DATA
  workspaceData: any;

  canActivateBilling: boolean = false;

  constructor(
    private injector: Injector,
    private router: ActivatedRoute,
    private utilityService: UtilityService,
    private managementPortalService: ManagementPortalService,
    private routeStateService: RouteStateService
  ) {
    this.subSink.add(this.routeStateService?.pathParams.subscribe(async (res) => {
      if(res){
        this.routerFromEvent = res;
        await this.ngOnInit();
      }
    }));
  }

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector)

  async ngOnInit() {
    // Get current loggedIn user data
    const currentUserData = await this.publicFunctions.getCurrentUser();

    const userId = this.router.snapshot.queryParamMap.get('userId');
    if (userId) {
      // Fetch the current user
      await this.publicFunctions.getOtherUser(this.router.snapshot.queryParamMap.get('userId')).then(async res => {
        this.userData = res;

        this.isCurrentUser = await this.checkIsCurrentUser(currentUserData._id);
      });
    } else {
      // Fetch the current user
      await this.publicFunctions.getCurrentUser().then(user => this.userData = user);
      this.isCurrentUser = true;
    }

    // Subscribe to the change in workspace data from the socket server
    this.subSink.add(this.utilityService.currentWorkplaceData.subscribe((res) => {
      if (JSON.stringify(res) != JSON.stringify({})) {
        this.workspaceData = res;
      }
    }));

    if(this.routerFromEvent && this.routerFromEvent._urlSegment){
      const segments = this.routerFromEvent?._urlSegment?.children?.primary?.segments;
      this.activeState = segments?segments[segments.length-1].path:'';
    }


    this.utilityService.handleActiveStateTopNavBar().subscribe(event => {
      this.activeState = event;
    });

    this.checkCanActivateBilling();
  }

  /**
   * This function unsubscribes the data from the observables
   */
  ngOnDestroy(): void {
      this.subSink.unsubscribe();
  }

  async changeState(state:string){
    this.activeState = state;
  }

  /**
   * This function checks if this is currently loggedIn user
   */
  async checkIsCurrentUser(currentUserId) {
    return (this.userData._id == currentUserId) ? true : false;
  }

  /**
    * This function opens up the task content in a new modal, and takes #content in the ng-template inside HTML layout
    * @param content
    */
   async openDetails(content) {
    this.utilityService.openModal(content, {
      size: 'md',
      centered: true
    });
  }

  async checkCanActivateBilling() {
    const currentWorkspace = await this.publicFunctions.getCurrentWorkspace();
    this.subSink.add(this.managementPortalService.canActivateBilling(currentWorkspace['_id'], currentWorkspace['management_private_api_key']).subscribe(
      (res) => {
        this.canActivateBilling = res['status'] || false;
      }));
  }
}
