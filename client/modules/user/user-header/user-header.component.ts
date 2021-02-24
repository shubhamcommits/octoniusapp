import { Component, OnInit, Injector, OnDestroy } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SubSink } from 'subsink';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-user-header',
  templateUrl: './user-header.component.html',
  styleUrls: ['./user-header.component.scss']
})
export class UserHeaderComponent implements OnInit, OnDestroy {

  constructor(
    private router: ActivatedRoute,
    private _router: Router,
    private injector: Injector,
    public utilityService: UtilityService
  ) {

    // Sunscribe to router updates
    this.subSink.add(this._router.events.subscribe((e: any) => {
      // If it is a NavigationEnd event re-initalise the component
      if (e instanceof NavigationEnd) {
        this.ngOnInit()
      }
    }))
  }

  // Router Subscription
  public navigationSubscription: any;

  // CURRENT USER DATA
  public userData: any;

  public workspaceData: any;

  // BASE URL OF THE APPLICATION
  BASE_URL = environment.UTILITIES_USERS_UPLOADS;

  // Is current user variable
  public isCurrentUser: any = false;

  // UNSUBSCRIBE THE DATA
  private subSink = new SubSink();

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  async ngOnInit() {
    // Fetch the userData from the server
    await this.publicFunctions.getOtherUser(this.router.snapshot.queryParams['userId']).then(res => {
      this.userData = res;
      this.utilityService.updateOtherUserData(this.userData);
    });
    // Get current workspaceData
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    // Setting Home State
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'user-account'
    })

  }

  /**
   * This functions unsubscribes all the observables subscription to avoid memory leak
   */
  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

  /**
   * This function checks if this is currently loggedIn user
   * @param userData
   */
  async checkIsCurrentUser() {

    // Get current loggedIn user data
    const userData = await this.publicFunctions.getCurrentUser();
    const userId = this.router.snapshot.queryParams['userId'];

    // If this is current loggedIn user
    if (userId == userData._id) {
      return true;
    } else {
      return false;
    }
  }

  /**
    * This function opens up the task content in a new modal, and takes #content in the ng-template inside HTML layout
    * @param content
    */
   async openUserDetails(content) {
    this.utilityService.openModal(content, {
      size: 'xl',
      centered: true
    });
  }

}
