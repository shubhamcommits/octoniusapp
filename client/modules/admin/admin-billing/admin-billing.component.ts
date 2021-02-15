import { Component, OnInit, Injector, OnDestroy  } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';
import { SubSink } from 'subsink';
import moment from 'moment';

@Component({
  selector: 'app-admin-billing',
  templateUrl: './admin-billing.component.html',
  styleUrls: ['./admin-billing.component.scss']
})
export class AdminBillingComponent implements OnInit, OnDestroy  {

  constructor(
    private injector: Injector
  ) { }

  // User Data Variable
  userData: any;

  // Workspace Data Varibale
  workspaceData: any;

  // Public Function Object
  publicFunctions = new PublicFunctions(this.injector);

  // Subsink Object
  public subSink = new SubSink()

  async ngOnInit() {

    // Setting Home State
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'admin'
    })

    let utilityService = this.injector.get(UtilityService)

    // Subscribe to the change in workspace data from the socket server
    this.subSink.add(utilityService.currentWorkplaceData.subscribe((res) => {
      if (JSON.stringify(res) != JSON.stringify({})) {
        this.workspaceData = res;
      }
    }));

    // Fetches the user data
    this.userData = await this.publicFunctions.getCurrentUser();

    // Fetches the workspace data
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    const workspaceData = await this.publicFunctions.getCurrentWorkspace();

    if ((this.userData?.role == 'admin' || this.userData?.role == 'owner')
        && (workspaceData['time_remaining'] <= 0
          || !workspaceData['billing']?.current_period_end
          || (workspaceData['time_remaining'] > 0
            && moment(workspaceData['billing']?.current_period_end).isBefore(moment())))
        && !workspaceData['billing']?.subscription_id) {
      utilityService.openTryOutNotification(workspaceData['time_remaining']);
    }
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subSink.unsubscribe();
  }


}
