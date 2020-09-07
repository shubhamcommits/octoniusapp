import { Component, OnInit, Input, Injector, EventEmitter, Output } from '@angular/core';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { SocketService } from 'src/shared/services/socket-service/socket.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-subscription-details',
  templateUrl: './subscription-details.component.html',
  styleUrls: ['./subscription-details.component.scss']
})
export class SubscriptionDetailsComponent implements OnInit {

  constructor(
    private injector: Injector
  ) { }

  // Subscription Data Object
  @Input('subscription') subscription: any;

  // Public Functions Object
  @Input('publicFunctions') publicFunctions: any;

  @Output() subscriptionCanceled = new EventEmitter();

  @Output() subscriptionResume = new EventEmitter();

  // Workspace object
  workspaceService = this.injector.get(WorkspaceService);

  // Socket Service Object
  socketService = this.injector.get(SocketService);

  // Utility Service Object
  utilityService = this.injector.get(UtilityService);

  ngOnInit() {
  }

  /**
   * This Function is responsible for cancelling the subscription
   */
  async cancelSubscription() {

    // Call the helper function
    await this.onCancelSubscription(this.workspaceService, this.socketService, this.utilityService);
  }

  /**
   * This function is the helper function for cancelling the sunscription
   * @param workspaceService
   * @param socketService
   * @param utilityService
   */
  async onCancelSubscription(workspaceService: WorkspaceService, socketService: SocketService, utilityService: UtilityService) {
    let confirmed = false;
    // Cancel the subscription
    await utilityService.getConfirmDialogAlert()
      .then((result) => {
        if (result.value) {
          confirmed = true;
        }
      });
      if (confirmed) {
        // Cancel Subscription
        return workspaceService.cancelSubscription()
          .then((res) => {
            this.subscription.cancel_at_period_end = res['subscription'].cancel_at_period_end;
            this.subscriptionCanceled.emit(this.subscription);

            // Send notification to the user
            utilityService.resolveAsyncPromise('Subscription Cancelled successfully!');
          })
          .catch(() => utilityService.rejectAsyncPromise('Unable to cancel the Subscription, please try again!'));
      }
  }

  /**
   * This function is responsible for resuming the subscription
   */
  async resumeSubscription() {

    // Call the helper function
    await this.onResumeSubscription(this.workspaceService, this.socketService, this.utilityService);
  }

  /**
   * This function is the helper function for resuming the subscription
   * @param workspaceService
   * @param socketService
   * @param utilityService
   */
  async onResumeSubscription(workspaceService: WorkspaceService, socketService: SocketService, utilityService: UtilityService) {

    // Resume the subscription
    return workspaceService.resumeSubscription()
      .then((res) => {
        this.subscription.cancel_at_period_end = res['subscription'].cancel_at_period_end;
        this.subscriptionResume.emit(this.subscription);

        // Send notification to the user
        utilityService.successNotification('Subscription resumed successfully!');
      })
      .catch(() => utilityService.errorNotification('Unable to resume the Subscription, please try again!'))
  }


}
