import { Component, OnInit, HostListener, Input, Injector } from '@angular/core';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { environment } from 'src/environments/environment';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'src/app/dashboard/public.functions';
import * as moment from 'moment';
import { SocketService } from 'src/shared/services/socket-service/socket.service';

// STRIPE CHECKOUT VARIABLE
declare const StripeCheckout: any;

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

  // Stripe Payment Handler
  handler: any;

  // Amount per seat (1000 is equals to 10 Dollars/Euros) - Calculate the maths according to this
  amount = 1000; // equals 10 dollars

  // Subscription Object
  subscription = null;

  // Failed Payments Array linked with webhooks
  failedPayments = [];

  // Success Payments Array linked with webhooks
  successPayments = [];

  // Public Functions object
  publicFunctions = new PublicFunctions(this.injector);

  async ngOnInit() {

    // Configure the payment handler
    this.handler = await this.configureHandler();

    // Check and fetch the subscription details
    await this.subscriptionExistCheck(this.workspaceData);

  }

  /**
   * This function prepares the stripe payment handler for accepting the cards and initiate the payments
   */
  async configureHandler() {

    // Workspace object
    let workspaceService = this.injector.get(WorkspaceService)

    // Socket Service Object
    let socketService = this.injector.get(SocketService)

    // Utility Service Object
    let utilityService = this.injector.get(UtilityService)

    // Intantiate the stripe checkout modal
    return StripeCheckout.configure({
      key: environment.pk_stripe,
      image: '/favicon.256x256.png',
      currency: 'EUR',
      locale: 'auto',
      token: (token: any) => {

        // On recieving the token, create a new subcription
        workspaceService.createSubscription(token, this.amount)
          .then(res => {

            // Set the subscription object 
            this.subscription = res['subscription'];

            // Update the subscription amount
            this.subscription.amount = (this.subscription.amount / 100);

            // Set the Workspace Data
            this.workspaceData.billing = res['workspace'];

            console.log(this.workspaceData);

            // Send the workspace data to other parts of the application
            this.publicFunctions.sendUpdatesToWorkspaceData(this.workspaceData);

            // Update the localdata of all the connected users 
            this.publicFunctions.emitWorkspaceData(socketService, this.workspaceData)
          })
          .catch(() => utilityService.errorNotification('Unable to create the Subscription, please try again!'))
      }
    });
  }

  /**
   * This Function is responsible for cancelling the subscription
   */
  async cancelSubscription() {
    // Workspace object
    let workspaceService = this.injector.get(WorkspaceService)

    // Socket Service Object
    let socketService = this.injector.get(SocketService)

    // Utility Service Object
    let utilityService = this.injector.get(UtilityService)

    return utilityService.getConfirmDialogAlert()
      .then((result) => {
        if (result.value) {

          // Cancel Subscription
          workspaceService.cancelSubscription()
            .then((res) => {

              // Update the workspace Data
              this.workspaceData.billing.scheduled_cancellation = true;

              // Send updates to the workspaceData
              this.publicFunctions.sendUpdatesToWorkspaceData(this.workspaceData);

              // Update the localdata of all the connected users 
              this.publicFunctions.emitWorkspaceData(socketService, this.workspaceData);

              // Send notification to the user
              utilityService.warningNotification('Subscription Cancelled successfully!');
            })
            .catch(() => utilityService.errorNotification('Unable to cancel the Subscription, please try again!'))
        }
      })
  }

  /**
   * This is the helper function to initiate the payment
   */
  handlePayment() {
    this.handler.open({
      name: 'Octonius workspace',
      description: 'Start a monthly subscription',
      amount: this.amount
    });
  }

  // when user redirects or presses the back button
  @HostListener('window: popstate')
  onPopstate() {
    this.handler.close();
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

  /**
   * This function is responsible for resuming the subscription
   */
  async resumeSubscription() {

    // Workspace Service Object
    let workspaceService = this.injector.get(WorkspaceService)

    // Socket Service Object
    let socketService = this.injector.get(SocketService)

    // Utility Service Object
    let utilityService = this.injector.get(UtilityService)

    // Resume the subscription
    return workspaceService.resumeSubscription()
      .then((res) => {

        // Workspace Data Update
        this.workspaceData.billing.scheduled_cancellation = false;

        // Send updates to the workspaceData
        this.publicFunctions.sendUpdatesToWorkspaceData(this.workspaceData)

        // Update the localdata of all the connected users 
        this.publicFunctions.emitWorkspaceData(socketService, this.workspaceData);

        // Send notification to the user
        utilityService.successNotification('Subscription resumed successfully!');
      })
      .catch(() => utilityService.errorNotification('Unable to resume the Subscription, please try again!'))
  }

}
