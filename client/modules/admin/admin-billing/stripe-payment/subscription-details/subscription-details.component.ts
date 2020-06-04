import { Component, OnInit, Input, Injector } from '@angular/core';
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

  // Workspace Data Object
  @Input('workspaceData') workspaceData: any;

  // Subscription Data Object
  @Input('subscription') subscription: any;

  // Public Functions Object
  @Input('publicFunctions') publicFunctions: any;

  ngOnInit() {
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

    // Call the helper function
    await this.onCancelSubscription(workspaceService, socketService, utilityService)
  }

  /**
   * This function is the helper function for cancelling the sunscription
   * @param workspaceService 
   * @param socketService 
   * @param utilityService 
   */
  async onCancelSubscription(workspaceService: WorkspaceService, socketService: SocketService, utilityService: UtilityService) {
    
    // Cancel the subscription
    return utilityService.getConfirmDialogAlert()
      .then((result) => {
        if (result.value) {

          utilityService.asyncNotification('Please wait we are cancelling your subscription...',
            new Promise((resolve, reject) => {
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
                  resolve(utilityService.resolveAsyncPromise('Subscription Cancelled successfully!'));
                })
                .catch(() => reject(utilityService.rejectAsyncPromise('Unable to cancel the Subscription, please try again!')))
            }))
        }
      })
  }

  /**
   * This function is responsible for resuming the subscription
   */
  async resumeSubscription() {
    
    // Workspace object
    let workspaceService = this.injector.get(WorkspaceService)

    // Socket Service Object
    let socketService = this.injector.get(SocketService)

    // Utility Service Object
    let utilityService = this.injector.get(UtilityService)

    // Call the helper function
    await this.onResumeSubscription(workspaceService, socketService, utilityService)
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
