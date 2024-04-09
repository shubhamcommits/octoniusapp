import { Component, OnInit, Injector, OnDestroy  } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { ManagementPortalService } from 'src/shared/services/management-portal-service/management-portal.service';

@Component({
  selector: 'app-admin-billing',
  templateUrl: './admin-billing.component.html',
  styleUrls: ['./admin-billing.component.scss']
})
export class AdminBillingComponent implements OnInit  {

  constructor(
    private managementPortalService: ManagementPortalService,
    private injector: Injector
  ) { }

  // User Data Variable
  userData: any;

  // Workspace Data Varibale
  workspaceData: any;

  // Public Function Object
  publicFunctions = new PublicFunctions(this.injector);

  async ngOnInit() {

    // Setting Home State
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'admin'
    })
    
    // Fetches the user data
    this.userData = await this.publicFunctions.getCurrentUser();

    // Fetches the workspace data
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    // Disabling the stripe integration for now, we are handling the payments and blocking the workspace manualy
    /*
    let utilityService = this.injector.get(UtilityService)
    this.managementPortalService.isInTryOut(this.workspaceData?._id, this.workspaceData?.management_private_api_key).then(res => {
      if ((this.userData?.role == 'admin' || this.userData?.role == 'owner')
          && res['status']) {
        utilityService.openTryOutNotification(res['time_remaining']);
      }
    });
    */
  }
}
