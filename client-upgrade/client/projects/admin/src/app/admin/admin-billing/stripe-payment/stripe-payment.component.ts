import { Component, OnInit, HostListener, Input, Injector } from '@angular/core';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { environment } from 'src/environments/environment';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'src/app/dashboard/public.functions';
import * as moment from 'moment';

// STRIPE CHECKOUT VARIABLE
declare const StripeCheckout: any;

@Component({
  selector: 'app-stripe-payment',
  templateUrl: './stripe-payment.component.html',
  styleUrls: ['./stripe-payment.component.scss']
})
export class StripePaymentComponent implements OnInit {

  constructor(
    private injector: Injector
  ) { }

  @Input('workspaceData') workspaceData: any;
  @Input('userData') userData: any;

  handler: any;
  amount = 1000; // equals 10 dollars

  subscription = null;

  failedPayments = [];
  successPayments = [];

  publicFunctions = new PublicFunctions(this.injector);

  async ngOnInit() {
    this.failedPayments = this.workspaceData.billing.failed_payments;
    this.successPayments = this.workspaceData.billing.success_payments;
    await this.configureHandler();
    await this.subscriptionExistCheck(this.workspaceData);

  }

  async configureHandler() {
    let workspaceService = this.injector.get(WorkspaceService)
    this.handler = StripeCheckout.configure({
      key: environment.pk_stripe,
      image: '/favicon.256x256.png',
      currency: 'EUR',
      locale: 'auto',
      token: (token) => {
        console.log(token)
        workspaceService.createSubscription(token, this.amount)
          .subscribe(res => {
            this.subscription = res['subscription'];
            this.workspaceData = res['workspace'];
            this.publicFunctions.sendUpdatesToWorkspaceData(this.workspaceData);
          })
      }
    });
  }

  async cancelSubscription() {
    let workspaceService = this.injector.get(WorkspaceService);
    let utilityService = this.injector.get(UtilityService);
    utilityService.getConfirmDialogAlert()
      .then(() => {
        workspaceService.cancelSubscription()
          .subscribe(res => {
            this.workspaceData = res['workspace'];
            this.publicFunctions.sendUpdatesToWorkspaceData(this.workspaceData);
            utilityService.getSwalFire('Cancellation complete!', "If you would like to resume your subscription," +
              " you can do so up until the end of the current billing cycle", 'info');
          });
      });

  }

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

  async subscriptionExistCheck(workspaceData: any) {
    let workspaceService = this.injector.get(WorkspaceService)
    if (!!workspaceData.billing && workspaceData.billing.current_period_end > moment().unix()) {
      workspaceService.getSubscription()
        .subscribe((res) => {
          console.log(res);
          this.subscription = res['subscription'];
          this.subscription.amount = (this.subscription.amount/100);
        });
    } else {
      this.subscription = null;
    }
  }

  async renewSubscription() {
    let workspaceService = this.injector.get(WorkspaceService)
    workspaceService.renewSubscription()
      .subscribe(res => {
        // display the new subscription information
        this.subscription = res['subscription'];
        // update the workspace data
        this.workspaceData = res['workspace'];
        // The failed payments should be empty after this
        this.failedPayments = this.workspaceData.billing.failed_payments;
        this.publicFunctions.sendUpdatesToWorkspaceData(this.workspaceData)
      });
  }

  async resumeSubscription() {
    let workspaceService = this.injector.get(WorkspaceService);
    let utilityService = this.injector.get(UtilityService);
    workspaceService.resumeSubscription()
      .subscribe((res) => {
        this.workspaceData.billing.scheduled_cancellation = false;
        this.publicFunctions.sendUpdatesToWorkspaceData(this.workspaceData)
        utilityService.successNotification('Good Job, you have sucessfully resumed your subscription!');
      });
  }

}
