import { Component, OnInit, HostListener, Injector, Input } from '@angular/core';
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

  // Stripe Payment Handler
  handler: any;

  // Amount per seat (1000 is equals to 10 Dollars/Euros) - Calculate the maths according to this
  amount = 1000; // equals 10 dollars

  async ngOnInit() {

      // Workspace object
      let workspaceService = this.injector.get(WorkspaceService)

      // Socket Service Object
      let socketService = this.injector.get(SocketService)
  
      // Utility Service Object
      let utilityService = this.injector.get(UtilityService)

      // Configure the payment handler
      this.handler = await this.configureHandler(workspaceService, socketService, utilityService);
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

  /**
   * This function prepares the stripe payment handler for accepting the cards and initiate the payments
   */
  async configureHandler(workspaceService: WorkspaceService, socketService: SocketService, utilityService: UtilityService) {

    // Intantiate the stripe checkout modal
    return StripeCheckout.configure({
      key: environment.pk_stripe,
      image: '/favicon.256x256.png',
      currency: 'EUR',
      locale: 'auto',
      token: (token: any) => {

        // On recieving the token, create a new subcription
        utilityService.asyncNotification('Please wait we creating the subscription for you...', 
        new Promise((resolve, reject)=>{
          workspaceService.createSubscription(token, this.amount)
          .then(res => {

            // Set the subscription object 
            this.subscription = res['subscription'];

            // Update the subscription amount
            this.subscription.amount = (this.subscription.amount / 100);

            // Set the Workspace Data
            this.workspaceData.billing = res['workspace']['billing'];

            // Send the workspace data to other parts of the application
            this.publicFunctions.sendUpdatesToWorkspaceData(this.workspaceData);

            // Update the localdata of all the connected users 
            this.publicFunctions.emitWorkspaceData(socketService, this.workspaceData)

            // Resolve the promise
            resolve(utilityService.resolveAsyncPromise('Subscription Created Successfully!'))
          })
          .catch(() => reject(utilityService.rejectAsyncPromise('Unable to create the Subscription, please try again!')))
        }))

      }
    });
  }

  /**
   * This function handles when component is destroyed
   */
  ngOnDestroy(){
    this.handler.close();
  }

}
