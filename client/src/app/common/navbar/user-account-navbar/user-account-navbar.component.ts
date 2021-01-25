import { Component, Injector, OnInit, OnDestroy } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { environment } from 'src/environments/environment';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-user-account-navbar',
  templateUrl: './user-account-navbar.component.html',
  styleUrls: ['./user-account-navbar.component.scss']
})
export class UserAccountNavbarComponent implements OnInit, OnDestroy {

  // User Data
  userData: any;

  // WORKSPACE DATA
  workspaceData: any;

  baseUrl = environment.UTILITIES_WORKSPACES_UPLOADS;
  userBaseUrl = environment.UTILITIES_USERS_UPLOADS;

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector)

  // SUBSINK
  private subSink = new SubSink();

  constructor(
    private injector: Injector,
    private utilityService: UtilityService
  ) { }

  async ngOnInit() {
    await this.publicFunctions.getCurrentUser().then(user => this.userData = user);

    // Subscribe to the change in workspace data from the socket server
    this.subSink.add(this.utilityService.currentWorkplaceData.subscribe((res) => {
      if (JSON.stringify(res) != JSON.stringify({})) {
        this.workspaceData = res;
      }
    }));
  }

  /**
   * This functions unsubscribes all the observables subscription to avoid memory leak
   */
  ngOnDestroy(): void {
    this.subSink.unsubscribe()
  }

  /**
    * This function opens up the task content in a new modal, and takes #content in the ng-template inside HTML layout
    * @param content
    */
   async openDetails(content) {
    this.utilityService.openModal(content, {
      size: 'xl',
      centered: true
    });
  }
}
