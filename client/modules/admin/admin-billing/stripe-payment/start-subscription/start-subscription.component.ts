import { Component, OnInit, HostListener, Injector, Input, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SocketService } from 'src/shared/services/socket-service/socket.service';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';


// STRIPE CHECKOUT VARIABLE
declare const StripeCheckout: any;

@Component({
  selector: 'app-start-subscription',
  templateUrl: './start-subscription.component.html',
  styleUrls: ['./start-subscription.component.scss']
})
export class StartSubscriptionComponent implements OnInit {

  constructor(private injector: Injector) { }

  // Workspace Data Object
  @Input('workspaceData') workspaceData: any;

  // User Data Object
  @Input('userData') userData: any;

  // Public Functions Object
  @Input('publicFunctions') publicFunctions: any;

  // Subscription Data Object
  @Input('subscription') subscription: any;

  @Output() subscriptionCreated = new EventEmitter();

  // Stripe Payment Handler
  handler: any;

  // Workspace object
  workspaceService = this.injector.get(WorkspaceService);

  // Socket Service Object
  socketService = this.injector.get(SocketService)

  // Utility Service Object
  utilityService = this.injector.get(UtilityService)

  amount = 0;
  priceId;

  subscription_prices = [];

  stripeSessionId;

  async ngOnInit() {
    // Configure the payment handler
    this.handler = await this.configureHandler(this.workspaceService, this.socketService, this.utilityService);

    await this.getSubscriptionPrices();
  }

  /**
   * This function handles when component is destroyed
   */
  /*
  ngOnDestroy(){
    this.handler.close();
  }
  */

  async getSubscriptionPrices() {
    // await this.workspaceService.getSubscriptionPrices(this.workspaceData.billing.product_id)
    await this.workspaceService.getSubscriptionPrices(environment.product_stripe)
      .then(res => this.subscription_prices = res['prices'].data);
  }

  /**
   * This is the helper function to initiate the payment
   */
  handlePayment(priceId, amount) {
    this.amount = amount;
    this.priceId = priceId;
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

  /**
   * This function prepares the stripe payment handler for accepting the cards and initiate the payments
   */
  async configureHandler(workspaceService: WorkspaceService, socketService: SocketService, utilityService: UtilityService) {

    // Intantiate the stripe checkout modal
    return StripeCheckout.configure({
      key: environment.pk_stripe,
      image: '/favicon.256x256.png',
      currency: '$',
      locale: 'auto',
      token: (token: any) => {

        // On recieving the token, create a new subcription
        utilityService.asyncNotification('Please wait we creating the subscription for you...',
        new Promise((resolve, reject)=>{
          // workspaceService.createSubscription(token, this.amount)
          workspaceService.createSubscription(token, this.priceId, this.workspaceData.billing.product_id)
            .then(res => {
              // Set the subscription object
              this.subscription = res['subscription'];

              // Update the subscription amount
              // this.subscription.amount = (this.subscription.amount / 100);

              // Set the Workspace Data
              this.workspaceData.billing = res['workspace']['billing'];

              // Send the workspace data to other parts of the application
              this.publicFunctions.sendUpdatesToWorkspaceData(this.workspaceData);

              // Update the localdata of all the connected users
              this.publicFunctions.emitWorkspaceData(socketService, this.workspaceData)

              this.subscriptionCreated.emit(this.subscription);

              // Resolve the promise
              resolve(utilityService.resolveAsyncPromise('Subscription Created Successfully!'))
            })
            .catch(() => reject(utilityService.rejectAsyncPromise('Unable to create the Subscription, please try again!')))
        }))

      }
    });
  }

}
