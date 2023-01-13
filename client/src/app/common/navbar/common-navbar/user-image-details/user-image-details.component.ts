import { Component, OnInit, Input, Injector } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { SubSink } from 'subsink';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { UserService } from 'src/shared/services/user-service/user.service';
import { SocketService } from 'src/shared/services/socket-service/socket.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-user-image-details',
  templateUrl: './user-image-details.component.html',
  styleUrls: ['./user-image-details.component.scss']
})
export class UserImageDetailsComponent implements OnInit {

  constructor(
    private injector: Injector,
    private utilityService: UtilityService,
    private userService: UserService,
    private socketService: SocketService
  ) { }

  // User Data Variable
  @Input('userData') userData: any;

  // Workspace Data Variable
  @Input('workspaceData') workspaceData: any;

  // Cropped Image of the Input Image File
  croppedImage: File;

  // Unsubscribe the Data
  private subSink = new SubSink();

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector);

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
   * This function updates the user data
   * @param userAvatar
   */
  async updateUserDetails(userAvatar: File) {
    try {
      this.utilityService.asyncNotification($localize`:@@userImageDetails.pleaseWait:Please wait while we are updating your avatar ...`,
        new Promise((resolve, reject) => {
          this.subSink.add(this.userService.updateUserProfileImage(userAvatar, this.workspaceData._id)
            .subscribe((res) => {
              this.userData['profile_pic'] = res['user']['profile_pic'];

              // Find the index to check if the user exists inside the first 10 list of th workspace members
              let index = this.workspaceData.members.findIndex((member: any)=> member._id === this.userData['_id']);

              if(index != -1){

                // Updating the member's profile picture
                this.workspaceData.members[index]['profile_pic'] = this.userData['profile_pic'];

                // Update the localdata of all the connected users
                this.publicFunctions.emitWorkspaceData(this.socketService, this.workspaceData)
              }

              // Updating the data across the shared service in the application
              this.publicFunctions.sendUpdatesToUserData(this.userData);

              resolve(this.utilityService.resolveAsyncPromise($localize`:@@userImageDetails.avatarUpdated:Avatar updated!`));
            }, (err) => {
              console.log('Error occurred, while updating the avatar', err);
              reject(this.utilityService.rejectAsyncPromise($localize`:@@userImageDetails.oopsAnErrorOccured:Oops, an error occurred while updating the avatar, please try again!`));
            }))
        }))
    } catch (err) {
      console.log('There\'s some unexpected error occurred, please try again!', err);
      this.utilityService.errorNotification($localize`:@@userImageDetails.unexpectedError:'There\'s some unexpected error occurred, please try again!`);
    }
  }

  getUserProfilePicURL(fileName: string) {
    return environment.UTILITIES_WORKSPACES_UPLOADS + '/' + this.workspaceData?._id + '/' + fileName;
  }

  close() {
    this.utilityService.closeAllModals();
  }
}
