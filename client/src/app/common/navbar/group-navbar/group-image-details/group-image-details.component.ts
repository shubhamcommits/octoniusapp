import { Component, OnInit, Input, Injector } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-group-image-details',
  templateUrl: './group-image-details.component.html',
  styleUrls: ['./group-image-details.component.scss']
})
export class GroupImageDetailsComponent implements OnInit {
  
  // Group Data
  @Input('groupData') groupData: any;
  
  // Cropped Image of the Input Image File
  croppedImage: File;
  
  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector);
  
  constructor(
    private injector: Injector
  ) { }

  ngOnInit() {
  }

  /**
   * This function recieves the @Output from @module <app-crop-image></app-crop-image>
   * @param $event - as the cropped image File
   */
  getCroppedImage($event: File) {
    this.croppedImage = $event;
  }

  updateImage() {

    // Group Service Instance
    let groupService = this.injector.get(GroupService)
    let utilityService = this.injector.get(UtilityService)

    utilityService.asyncNotification($localize`:@@groupImageDetails.pleaseWaitWhileWeUpdate:Please wait while we are updating the group avatar...`,
      new Promise((resolve, reject) => {

        groupService.updateGroupImage(this.groupData._id, this.croppedImage, (this.groupData._workspace._id || this.groupData._workspace))
        .then((res)=>{

          this.groupData.group_avatar = res['group']['group_avatar'];

          this.publicFunctions.sendUpdatesToGroupData(this.groupData)

          resolve(utilityService.resolveAsyncPromise($localize`:@@groupImageDetails.groupAvatarUpdated:Group Avatar Updated!`))
        })
        .catch(()=>{
          reject(utilityService.rejectAsyncPromise($localize`:@@groupImageDetails.unableToUpdateAvatar:Unable to update the group avatar!`))
        })

      }))
  }
}
