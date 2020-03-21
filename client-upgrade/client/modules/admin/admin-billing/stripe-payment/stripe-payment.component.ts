import * as moment from 'moment';
import { Component, OnInit, Input, Injector } from '@angular/core';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'src/app/dashboard/public.functions';
import { SocketService } from 'src/shared/services/socket-service/socket.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Component({
  selector: 'app-stripe-payment',
  templateUrl: './stripe-payment.component.html',
  styleUrls: ['./stripe-payment.component.scss']
})
export class StripePaymentComponent implements OnInit {

  constructor(
    private injector: Injector,
    public utilityService: UtilityService
  ) { }

  // Workspace Data Object
  @Input('workspaceData') workspaceData: any;

  // User Data Object
  @Input('userData') userData: any;

  // Subscription Object
  subscription = null;

  // Failed Payments Array linked with webhooks
  failedPayments = [];

  // Success Payments Array linked with webhooks
  successPayments = [];

  // Public Functions object
  publicFunctions = new PublicFunctions(this.injector);

  // isLoading BehaviourSubject
  isLoading$ = new BehaviorSubject(false);

  async ngOnInit() {

    // Check and fetch the subscription details
    await this.subscriptionExistCheck(this.workspaceData);

  }
  isWorkspaceOwner() {
    return this.workspaceData._owner == this.userData['_id'];
  }

  /**
   * This function is responsible for fetching the subcription details
   * @param workspaceData 
   */
  async subscriptionExistCheck(workspaceData: any) {

    // Workspace Service Object
    let workspaceService = this.injector.get(WorkspaceService)

    // Utility Service Object
    let utilityService = this.injector.get(UtilityService)

    if (!!workspaceData.billing && workspaceData.billing.current_period_end > moment().unix()) {
      workspaceService.getSubscription()
        .then((res) => {

          // Initialise the suncription
          this.subscription = res['subscription'];

          // Mend the Subscription Amount
          this.subscription.amount = (this.subscription.amount / 100);

          // Initialize the failed payments arrray from the current workspace data
          this.failedPayments = workspaceData.billing.failed_payments;

          // Initialize the success payments array from the current workspace data
          this.successPayments = workspaceData.billing.success_payments;
        })
        .catch(() => utilityService.errorNotification('Unable to fetch the Subscription details, please try again!'))
    } else {
      this.subscription = null;
    }
  }

  /**
   * This function is responsible to renewing the subscription and start it from fresh
   */
  async renewSubscription() {

    // Workspace Service Object
    let workspaceService = this.injector.get(WorkspaceService)

    // Socket Service Object
    let socketService = this.injector.get(SocketService)

    // Utility Service Object
    let utilityService = this.injector.get(UtilityService)

    // Renew the subscription
    return workspaceService.renewSubscription()
      .then((res) => {

        // display the new subscription information
        this.subscription = res['subscription'];

        // Update the subscription amount
        this.subscription.amount = (this.subscription.amount / 100);

        // update the workspace data
        this.workspaceData = res['workspace'];

        console.log(this.workspaceData);

        // The failed payments should be empty after this
        this.failedPayments = this.workspaceData.billing.failed_payments;

        // Send updates to the workspaceData
        // this.publicFunctions.sendUpdatesToWorkspaceData(this.workspaceData)

        // Update the localdata of all the connected users 
        // this.publicFunctions.emitWorkspaceData(socketService, this.workspaceData);

        // Send notification to the user
        utilityService.successNotification('Subscription renewed successfully!');
      })
      .catch(() => utilityService.errorNotification('Unable to renew the Subscription, please try again!'))
  }

}
