import { Component, OnInit, Input, Injector } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { SubSink } from 'subsink';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { UserService } from 'src/shared/services/user-service/user.service';
import { SocketService } from 'src/shared/services/socket-service/socket.service';

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

  // Base Url of the Application
  @Input('baseUrl') baseUrl: string;

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
      this.utilityService.asyncNotification('Please wait while we are updating your avatar ...',
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

              resolve(this.utilityService.resolveAsyncPromise('Avatar updated!'))
            }, (err) => {
              console.log('Error occured, while updating the avatar', err);
              reject(this.utilityService.rejectAsyncPromise('Oops, an error occured while updating the avatar, please try again!'))
            }))
        }))
    } catch (err) {
      console.log('There\'s some unexpected error occured, please try again!', err);
      this.utilityService.errorNotification('There\'s some unexpected error occured, please try again!');
    }
  }

  getUserProfilePicURL(fileName: string) {
    return this.baseUrl + '/' + fileName;
  }
}
