import { Component, OnInit, Input, Injector } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { PublicFunctions } from 'src/app/dashboard/public.functions';
import { SubSink } from 'subsink';
import { SocketService } from 'src/shared/services/socket-service/socket.service';
import { retry } from 'rxjs/internal/operators/retry';

@Component({
  selector: 'app-workspace-details',
  templateUrl: './workspace-details.component.html',
  styleUrls: ['./workspace-details.component.scss']
})
export class WorkspaceDetailsComponent implements OnInit {

  constructor(
    private utilityService: UtilityService,
    private workspaceService: WorkspaceService,
    private injector: Injector,
    private socketService: SocketService
  ) { }

  // USER DATA
  @Input('userData') userData: any;

  // WORKSPACE DATA
  @Input('workspaceData') workspaceData: any;

  // BASE URL OF THE APPLICATION
  @Input('baseUrl') baseUrl: string;

  // CROPPED IMAGE OR OUTPUT IMAGE
  croppedImage: File;

  // UNSUBSCRIBE THE DATA
  private subSink = new SubSink();

  private publicFunctions = new PublicFunctions(this.injector);

  ngOnInit() {
  }

  /**
   * This function recieves the @Output from @module <app-crop-image></app-crop-image>
   * @param $event - as the cropped image File
   */
  getCroppedImage($event: File) {
    this.croppedImage = $event;
  }

  /**
   * 
   * @param workspaceId 
   * @param workspaceAvatar 
   */
  async updateWorkplaceDetails(workspaceId: string, workspaceAvatar: File) {
    try {
      this.utilityService.asyncNotification('Please wait while we are updating the workspace avatar for you ...',
        new Promise((resolve, reject) => {
          this.subSink.add(this.workspaceService.updateWorkspace(workspaceId, workspaceAvatar)
            .subscribe((res) => {
              console.log(res);
              this.workspaceData['workspace_avatar'] = res['workspace']['workspace_avatar'];
              this.publicFunctions.sendUpdatesToWorkspaceData(this.workspaceData);
              this.workspaceData.workspaceId = workspaceId;
              this.subSink.add(this.socketService.onEmit('workspaceUpdated', this.workspaceData)
              .pipe(retry(Infinity))
              .subscribe((res)=> console.log(res)));
              resolve(this.utilityService.resolveAsyncPromise('Workspace avatar updated!'))
            }, (err) => {
              console.log('Error occured, while updating the workspace avatar', err);
              reject(this.utilityService.rejectAsyncPromise('Oops, an error occured while updating the workspace avatar, please try again!'))
            }))
        }))
    } catch (err) {
      console.log('There\'s some unexpected error occured, please try again!', err);
      this.utilityService.errorNotification('There\'s some unexpected error occured, please try again!');
    }
  }

  /**
   * This function unsubscribes the data from the observables
   */
  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }
}
