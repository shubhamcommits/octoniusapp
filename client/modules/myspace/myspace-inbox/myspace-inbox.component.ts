import { Component, OnInit, Injector, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { PublicFunctions } from 'modules/public.functions';
import { SocketService } from 'src/shared/services/socket-service/socket.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';
import { take } from 'rxjs/internal/operators/take';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/shared/services/user-service/user.service';
import moment from 'moment';
import { retry } from 'rxjs/internal/operators/retry';
import { ManagementPortalService } from 'src/shared/services/management-portal-service/management-portal.service';

@Component({
  selector: 'app-myspace-inbox',
  templateUrl: './myspace-inbox.component.html',
  styleUrls: ['./myspace-inbox.component.scss']
})
export class MyspaceInboxComponent implements OnInit, OnDestroy {

  // Current User Data
  userData: any;

  // BASE URL OF THE APPLICATION
  baseUrl = environment.UTILITIES_USERS_UPLOADS

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private managementPortalService: ManagementPortalService,
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

    this.managementPortalService.isInTryOut(workspaceData['_id'], workspaceData['management_private_api_key']).then(res => {
      if ((this.userData?.role == 'admin' || this.userData?.role == 'owner')
          && res['status']) {
        this.utilityService.openTryOutNotification(res['time_remaining']);
      }
    });
  }

  /**
   * Unsubscribe all the observables to avoid memory leaks
   */
  ngOnDestroy() {
  }
}
