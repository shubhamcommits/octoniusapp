import { Component, OnInit, Injector, OnDestroy } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { UserService } from 'src/shared/services/user-service/user.service';
// import { ManagementPortalService } from 'src/shared/services/management-portal-service/management-portal.service';

@Component({
  selector: 'app-myspace-inbox',
  templateUrl: './myspace-inbox.component.html',
  styleUrls: ['./myspace-inbox.component.scss']
})
export class MyspaceInboxComponent implements OnInit, OnDestroy {

  // Current User Data
  userData: any;

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    // private managementPortalService: ManagementPortalService,
    private injector: Injector,
    public utilityService: UtilityService,
    public userService: UserService
  ) {
  }

  async ngOnInit() {
    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'home'
    })

    // Fetch current user details
    this.userData = await this.publicFunctions.getCurrentUser();

    const workspaceData = await this.publicFunctions.getCurrentWorkspace();

    this.publicFunctions.sendUpdatesToGroupData({});

    // Disabling the stripe integration for now, we are handling the payments and blocking the workspace manualy
    /*
    this.managementPortalService.isInTryOut(workspaceData['_id'], workspaceData['management_private_api_key']).then(res => {
      if ((this.userData?.role == 'admin' || this.userData?.role == 'owner')
          && res['status']) {
        this.utilityService.openTryOutNotification(res['time_remaining']);
      }
    });
    */
  }

  /**
   * Unsubscribe all the observables to avoid memory leaks
   */
  ngOnDestroy() {
  }
}
