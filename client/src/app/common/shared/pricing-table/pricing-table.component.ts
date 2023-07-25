import { Component, OnInit, Injector, Input } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { ManagementPortalService } from 'src/shared/services/management-portal-service/management-portal.service';
import { loadStripe } from '@stripe/stripe-js';
import { AuthService } from 'src/shared/services/auth-service/auth.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-pricing-table',
  templateUrl: './pricing-table.component.html',
  styleUrls: ['./pricing-table.component.scss']
})
export class PricingTableComponent implements OnInit {
  
  @Input() workspaceData: any;
  @Input() canCreateSubscription = true;
  
  // Stripe Payment Handler
  handler: any;
  
  // PRICING_TABLE_ID = environment.STRIPE_PRICING_TABLE_ID;
  // STRIPE_PK = environment.STRIPE_PK;
  
  // Workspace object
  workspaceService = this.injector.get(WorkspaceService);
  
  // Utility Service Object
  utilityService = this.injector.get(UtilityService);
  
  // Management Portal Service Object
  managementPortalService = this.injector.get(ManagementPortalService);
  
  // auth Service Object
  authService = this.injector.get(AuthService);
  
  amount = 0;
  priceId;
  
  // subscription_prices = [];
  subscription_products = [];
  periodSelected = 'month';

  stripeSessionId;

  // isLoading BehaviourSubject
  isLoading$ = new BehaviorSubject(false);
  
  constructor(
      private injector: Injector
    ) { }

  async ngOnInit() {
    this.isLoading$.next(true);

    // await this.getSubscriptionPrices();
    await this.getSubscriptionProducts();
  }

  async getSubscriptionProducts() {
    await this.authService.getSubscriptionProducts()
      .then((res: any) => {
        this.subscription_products = res.products.products.filter(product => product && product.id != environment.STRIPE_ONPREMISE_PRODUCT_ID);
      });
    
    this.isLoading$.next(false);
  }

  startStripeCheckoutSession(priceId: string) {
    this.managementPortalService.createStripeCheckoutSession(priceId, this.workspaceData._id, window.location.href, this.workspaceData.management_private_api_key).then(async res => {
      var stripe = await loadStripe(res['pk_stripe']);
      stripe.redirectToCheckout({
        sessionId: res['session'].id
      });
    }).catch((err)=> {
      this.utilityService.errorNotification($localize`:@@pricingTable.errorWithYourSubscription:There is an error with your Subscription, please contact support!`);
    });
  }

  changePeriod(checked) {
    if (checked) {
      this.periodSelected = 'year';
    } else {
      this.periodSelected = 'month';
    }
  }
}
