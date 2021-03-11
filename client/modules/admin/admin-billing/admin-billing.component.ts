import { Component, OnInit, Injector, OnDestroy  } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment';

@Component({
  selector: 'app-admin-billing',
  templateUrl: './admin-billing.component.html',
  styleUrls: ['./admin-billing.component.scss']
})
export class AdminBillingComponent implements OnInit  {

  constructor(
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

    let utilityService = this.injector.get(UtilityService)

    // Fetches the user data
    this.userData = await this.publicFunctions.getCurrentUser();

    // Fetches the workspace data
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    if ((this.userData?.role == 'admin' || this.userData?.role == 'owner')
        && (this.workspaceData['time_remaining'] <= 0
          || !this.workspaceData['billing']?.current_period_end
          || (this.workspaceData['time_remaining'] > 0
            && moment(this.workspaceData['billing']?.current_period_end).isBefore(moment())))
        && !this.workspaceData['billing']?.subscription_id) {
      utilityService.openTryOutNotification(this.workspaceData['time_remaining']);
    }
  }
}
