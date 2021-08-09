import { Component, OnInit, Input, Injector } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { PublicFunctions } from 'modules/public.functions';
import { SubSink } from 'subsink';
import { SocketService } from 'src/shared/services/socket-service/socket.service';
import { retry } from 'rxjs/internal/operators/retry';

@Component({
  selector: 'app-workspace-details',
  templateUrl: './workspace-details.component.html',
  styleUrls: ['./workspace-details.component.scss']
})
export class WorkspaceDetailsComponent implements OnInit {

  // User Data Variable
  @Input('userData') userData: any;

  // Workspace Data Variable
  @Input('workspaceData') workspaceData: any;

  // Base Url of the Application
  @Input('baseUrl') baseUrl: string;

  // Cropped Image of the Input Image File
  croppedImage: File;

  // Unsubscribe the Data
  private subSink = new SubSink();

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private utilityService: UtilityService,
    private workspaceService: WorkspaceService,
    private injector: Injector,
    private socketService: SocketService
  ) { }

  ngOnInit() {
  }

  /**
   * This function unsubscribes the data from the observables
   */
  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

  /**
   * This function recieves the @Output from @module <app-crop-image></app-crop-image>
   * @param $event - as the cropped image File
   */
  getCroppedImage($event: File) {
    this.croppedImage = $event;
  }

  /**
   * This function updates the workspace data
   * @param workspaceId
   * @param workspaceAvatar
   */
  async updateWorkplaceDetails(workspaceId: string, workspaceAvatar: File) {
    try {
      this.utilityService.asyncNotification($localize`:@@workspaceDetails.pleaseWaitWhileWeUpdate:Please wait while we are updating the workspace avatar for you ...`,
        new Promise((resolve, reject) => {
          this.subSink.add(this.workspaceService.updateWorkspace(workspaceId, workspaceAvatar)
            .subscribe((res) => {
              this.workspaceData['workspace_avatar'] = res['workspace']['workspace_avatar'];

              // Updating the data across the shared service in the application
              this.publicFunctions.sendUpdatesToWorkspaceData(this.workspaceData);

              // Sends the updates to all the user connected in the same workspace
              this.subSink.add(this.emitWorkspaceData(this.socketService, this.workspaceData))

              resolve(this.utilityService.resolveAsyncPromise($localize`:@@workspaceDetails.workspaceAvatarUpdated:Workspace avatar updated!`));
            }, (err) => {
              console.log('Error occurred, while updating the workspace avatar', err);
              reject(this.utilityService.rejectAsyncPromise($localize`:@@workspaceDetails.oopsAnErrorOccured:Oops, an error occurred while updating the workspace avatar, please try again!`))
            }))
        }))
    } catch (err) {
      console.log('There\'s some unexpected error occurred, please try again!', err);
      this.utilityService.errorNotification($localize`:@@workspaceDetails.unexpectedError:There\'s some unexpected error occurred, please try again!`);
    }
  }

  /**
   * This functions sends the update to other users about the updated workspace data
   * @param socketService
   * @param workspaceData
   */
  emitWorkspaceData(socketService: SocketService, workspaceData: any){
    return socketService.onEmit('workspaceData', workspaceData).pipe(retry(Infinity)).subscribe()
  }
}
