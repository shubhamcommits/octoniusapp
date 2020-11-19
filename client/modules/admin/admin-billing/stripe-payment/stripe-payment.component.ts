import moment from 'moment/moment';
import { Component, OnInit, Input, Injector } from '@angular/core';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';
import { SocketService } from 'src/shared/services/socket-service/socket.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Router } from '@angular/router';

@Component({
  selector: 'app-stripe-payment',
  templateUrl: './stripe-payment.component.html',
  styleUrls: ['./stripe-payment.component.scss']
})
export class StripePaymentComponent implements OnInit {

  constructor(
    private injector: Injector,
    private router: Router
  ) { }

  // Workspace Data Object
  @Input('workspaceData') workspaceData: any;

  // User Data Object
  @Input('userData') userData: any;

  // Subscription Object
  subscription;

  // Payments Array
  charges = [];

  // Public Functions object
  publicFunctions = new PublicFunctions(this.injector);

  // Workspace Service Object
  workspaceService = this.injector.get(WorkspaceService);

  // Utility Service Object
  utilityService = this.injector.get(UtilityService);

  // Socket Service Object
  socketService = this.injector.get(SocketService);

  // isLoading BehaviourSubject
  isLoading$ = new BehaviorSubject(false);

  async ngOnInit() {

    // Check and fetch the subscription details
    await this.subscriptionExistCheck();

    // Obtain the client´s charges
    await this.getCharges();
  }
  isWorkspaceOwner() {
    return this.workspaceData._owner == this.userData['_id'];
  }

  /**
   * This function is responsible for fetching the subcription details
   * @param workspaceData
   */
  async subscriptionExistCheck() {
    if (this.workspaceData.billing.client_id) {
      this.workspaceService.getSubscription(this.workspaceData.billing.client_id)
        .then((res) => {
          let subscriptions = res['subscriptions']['data'];
          subscriptions.sort((s1, s2) => (s1.current_period_end > s2.current_period_end) ? 1 : -1);

          // Initialise the suncription
          this.subscription = subscriptions[subscriptions.length-1];
        })
        .catch(() => this.utilityService.errorNotification('Unable to fetch the Subscription details, please try again!'));
    } else {
      this.subscription = null;
    }
  }

  /**
   * This function is responsible for fetching the list of charges
   * @param workspaceData
   */
  async getCharges() {
    // this.workspaceService.getSubscription()--cus_HxVc4M2XSwAoV1--cus_GvQ3XcMhLqEGLT--
    if (this.workspaceData.billing.client_id) {
      this.workspaceService.getCharges(this.workspaceData.billing.client_id)
        .then((res) => {
          // Initialise the charges
          this.charges = res['charges'].data;
        })
        .catch(() => this.utilityService.errorNotification('Unable to fetch the list os Charges, please try again!')
      );
    }
  }

  /**
   * This function is responsible to renewing the subscription and start it from fresh
   */
  async renewSubscription() {

    // Renew the subscription
    return this.workspaceService.renewSubscription()
      .then((res) => {

        // display the new subscription information
        this.subscription = res['subscription'];

        // Update the subscription amount
        this.subscription.amount = (this.subscription.amount / 100);

        // update the workspace data
        this.workspaceData = res['workspace'];

        // Send notification to the user
        this.utilityService.successNotification('Subscription renewed successfully!');
      })
      .catch(() => this.utilityService.errorNotification('Unable to renew the Subscription, please try again!'))
  }

  onSubscriptionChanges(subscription) {
    this.subscription = subscription;
    this.router.navigate(['/home']);
  }

  isSubscriptionActive() {
    if (!this.workspaceData.billing.current_period_end || !this.subscription) {
      return false;
    }

    if (this.subscription.current_period_end < moment().unix()
      || this.workspaceData.billing.current_period_end < moment().unix()) {
      return false;
    }

    return true;
  }

  createCustomerPortalSession() {
    const parsedUrl = new URL(window.location.href);
    const baseUrl = parsedUrl.origin;
    let redirectUrl = baseUrl + '/#/dashboard/admin/general';

    this.workspaceService.createClientPortalSession(this.workspaceData.billing.client_id, redirectUrl).then(res => {
      window.location.href = res['session']['url'];
    }).then(res => console.log(res));
  }
}
