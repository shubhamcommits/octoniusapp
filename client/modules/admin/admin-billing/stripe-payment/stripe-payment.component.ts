import { Component, OnInit, Input, Injector } from '@angular/core';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { ActivatedRoute, Router } from '@angular/router';
import { ManagementPortalService } from 'src/shared/services/management-portal-service/management-portal.service';

@Component({
  selector: 'app-stripe-payment',
  templateUrl: './stripe-payment.component.html',
  styleUrls: ['./stripe-payment.component.scss']
})
export class StripePaymentComponent implements OnInit {

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

  // isLoading BehaviourSubject
  isLoading$ = new BehaviorSubject(false);

  constructor(
    private injector: Injector,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  async ngOnInit() {
    this.isLoading$.next(true);

    const sessionId = this.activatedRoute.snapshot.queryParams.session_id;
    if (sessionId) {
      await this.managementPortalService.getStripeCheckoutSession(sessionId, this.workspaceData._id, this.workspaceData.management_private_api_key)
        .then(res => {
          this.subscription = res['subscription'];
          this.workspaceData = res['workspace'];
        })
        .catch(function (err) {
          console.log('Error when fetching Checkout session', err);
          this.utilityService.errorNotification($localize`:@@stripePayment.unexpectedError:There\'s some unexpected error occurred, please try again!`);
        });

      await this.publicFunctions.sendUpdatesToWorkspaceData(this.workspaceData);

      this.router.navigate(['/home']);
    }

    // Check and fetch the subscription details
    await this.subscriptionExistCheck();

    // Check if the client exists in Stripe
    await this.stripeCustomerExists();

    await this.managementPortalService.getBillingStatus(this.workspaceData?._id, this.workspaceData?.management_private_api_key).then(
      (res) => {
        if (!res['status'] || !this.subscription || (!this.customer || this.customer.deleted)) {
          this.subscriptionActive = false;
        } else {
          this.subscriptionActive = true;
        }
      });
    
    this.isLoading$.next(false);
  }

  isWorkspaceOwner() {
    return this.workspaceData._owner == this.userData['_id'];
  }

  /**
   * This function is responsible for fetching the subcription details
   * @param workspaceData
   */
  async subscriptionExistCheck() {
    if (!this.subscription) {
      await this.managementPortalService.getSubscription()
        .then((res) => {
          // Initialise the suncription
          this.subscription = res['subscription'];
        })
        .catch(() => this.utilityService.errorNotification($localize`:@@stripePayment.unableFetchSubscriptionDetails:Unable to fetch the Subscription details, please try again!`));
    } else {
      this.subscription = null;
    }
  }

  /**
   * This function is responsible for fetching the stripe client details
   * @param workspaceData
   */
  async stripeCustomerExists() {
    await this.managementPortalService.getStripeCustomer(this.workspaceData._id, this.workspaceData.management_private_api_key)
      .then((res) => {
        this.customer = res['customer'];

        if (!this.customer) {
          this.subscription = null;
        }
      })
      .catch(() => this.utilityService.errorNotification($localize`:@@stripePayment.unableFetchSubscriptionDetails:Unable to fetch the Subscription details, please try again!`));

  }

  onSubscriptionChanges(subscription) {
    this.subscription = subscription;
    this.router.navigate(['/home']);
  }

  createCustomerPortalSession() {
    let redirectUrl = window.location.href;

    this.managementPortalService.createClientPortalSession(this.workspaceData._id, redirectUrl, this.workspaceData.management_private_api_key).then(res => {
      window.location.href = res['session']['url'];
    }).catch((err) => {
      this.utilityService.errorNotification($localize`:@@stripePayment.errorWithYourSubscription:There is an error with your Subscription, please contact support!`);
    });
  }
}
