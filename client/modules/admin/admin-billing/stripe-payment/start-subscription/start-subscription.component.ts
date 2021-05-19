import { Component, OnInit, HostListener, Injector, Input, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SocketService } from 'src/shared/services/socket-service/socket.service';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { loadStripe } from '@stripe/stripe-js';
import { ManagementPortalService } from 'src/shared/services/management-portal-service/management-portal.service';

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

  // Management Portal Service Object
  managementPortalService = this.injector.get(ManagementPortalService)

  amount = 0;
  priceId;

  subscription_prices = [];

  stripeSessionId;

  async ngOnInit() {
    // Configure the payment handler
    // this.handler = await this.configureHandler(this.workspaceService, this.socketService, this.utilityService);

    await this.getSubscriptionPrices();
  }

  async getSubscriptionPrices() {
    await this.managementPortalService.getSubscriptionPrices(environment.product_stripe)
      .then(res => {
        this.subscription_prices = res['prices'].data;
      });
  }

  startStripeCheckoutSession(priceId: string) {
    this.managementPortalService.createStripeCheckoutSession(priceId, this.workspaceData._id, window.location.href, this.workspaceData.management_private_api_key).then(async res => {
      var stripe = await loadStripe(environment.pk_stripe);
      stripe.redirectToCheckout({
        sessionId: res['session'].id
      });
    }).catch((err)=> {
      this.utilityService.errorNotification('There is an error with your Subscription, please contact support!');
    });
  }
}
