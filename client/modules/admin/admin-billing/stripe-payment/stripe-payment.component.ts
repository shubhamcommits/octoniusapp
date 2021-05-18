import moment from 'moment/moment';
import { Component, OnInit, Input, Injector } from '@angular/core';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';
import { SocketService } from 'src/shared/services/socket-service/socket.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { ActivatedRoute, Router } from '@angular/router';
import { ManagementPortalService } from 'src/shared/services/management-portal-service/management-portal.service';

@Component({
  selector: 'app-stripe-payment',
  templateUrl: './stripe-payment.component.html',
  styleUrls: ['./stripe-payment.component.scss']
})
export class StripePaymentComponent implements OnInit {

  constructor(
    private injector: Injector,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  // Workspace Data Object
  @Input('workspaceData') workspaceData: any;

  // User Data Object
  @Input('userData') userData: any;

  // Stripe Subscription Object
  subscription;

  // Stripe Customer object
  customer;

  // Payments Array
  charges = [];

  subscriptionActive = false;

  // Public Functions object
  publicFunctions = new PublicFunctions(this.injector);

  // Workspace Service Object
  workspaceService = this.injector.get(WorkspaceService);

  // Management Portal Service Object
  managementPortalService = this.injector.get(ManagementPortalService);

  // Utility Service Object
  utilityService = this.injector.get(UtilityService);

  // Socket Service Object
  socketService = this.injector.get(SocketService);

  // isLoading BehaviourSubject
  isLoading$ = new BehaviorSubject(false);

  async ngOnInit() {
    const sessionId = this.activatedRoute.snapshot.queryParams.session_id;
    if (sessionId) {
      await this.managementPortalService.getStripeCheckoutSession(sessionId, this.workspaceData._id, this.workspaceData.management_private_api_key)
        .then(res => {
          this.subscription = res['subscription'];
          this.workspaceData = res['workspace'];
        })
        .catch(function(err){
          console.log('Error when fetching Checkout session', err);
          this.utilityService.errorNotification('There\'s some unexpected error occured, please try again!');
        });

        await this.publicFunctions.sendUpdatesToWorkspaceData(this.workspaceData);

        this.router.navigate(['/home']);
    }

    // Check and fetch the subscription details
    await this.subscriptionExistCheck();

    // Check if the client exists in Stripe
    await this.stripeCustomerExists();

    await this.workspaceService.getBillingStatus(this.workspaceData?._id).then(
      (res) => {
        if ( !res['status'] || !this.subscription || (!this.customer || this.customer.deleted)) {
          this.subscriptionActive = false;
        } else {
          this.subscriptionActive = true;
        }
      });
    // Obtain the client´s charges
    // await this.getCharges();
  }

  isWorkspaceOwner() {
    return this.workspaceData._owner == this.userData['_id'];
  }

  /**
   * This function is responsible for fetching the subcription details
   * @param workspaceData
   */
  async subscriptionExistCheck() {
    if (this.workspaceData?.billing?.subscription_id && !this.subscription) {
      await this.workspaceService.getSubscription(this.workspaceData.billing.subscription_id)
        .then((res) => {
          // Initialise the suncription
          this.subscription = res['subscription'];
        })
        .catch(() => this.utilityService.errorNotification('Unable to fetch the Subscription details, please try again!'));
    } else {
      this.subscription = null;
    }
  }

  /**
   * This function is responsible for fetching the stripe client details
   * @param workspaceData
   */
  async stripeCustomerExists() {
    if (this.workspaceData.billing.client_id) {
      await this.workspaceService.getStripeCustomer(this.workspaceData.billing.client_id)
        .then((res) => {
          this.customer = res['customer'];
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
      await this.workspaceService.getCharges(this.workspaceData.billing.client_id)
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

  createCustomerPortalSession() {
    let redirectUrl = window.location.href;

    this.managementPortalService.createClientPortalSession(this.workspaceData.billing.client_id, redirectUrl, this.workspaceData.management_private_api_key).then(res => {
      window.location.href = res['session']['url'];
    }).catch((err)=> {
      this.utilityService.errorNotification('There is an error with your Subscription, please contact support!');
    });
  }
}
