import { Component, OnInit, Input, Injector } from '@angular/core';
import { SubSink } from 'subsink';
import { PublicFunctions } from 'modules/public.functions';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-group-background-image-details',
  templateUrl: './group-background-image-details.component.html',
  styleUrls: ['./group-background-image-details.component.scss']
})
export class GroupBackgroundImageDetailsComponent implements OnInit {

  constructor(
    private injector: Injector
  ) { }

  // BaseUrl
  @Input('baseUrl') baseUrl: any;

  // Group Data
  @Input('groupData') groupData: any;

  // Cropped Image of the Input Image File
  croppedImage: File;

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

  updateImage() {

    // Group Service Instance
    let groupService = this.injector.get(GroupService)
    let utilityService = this.injector.get(UtilityService)

    utilityService.asyncNotification($localize`:@@groupBackgroundImageDetails.pleaseWaitWhileWeUpdate:Please wait while we are updating the group...`,
      new Promise((resolve, reject) => {

          groupService.updateGroupImage(this.groupData._id, this.croppedImage, (this.groupData._workspace._id || this.groupData._workspace), true).then((res)=>{

            this.groupData.background_image = res['group']['background_image'];
            this.publicFunctions.sendUpdatesToGroupData(this.groupData)
            resolve(utilityService.resolveAsyncPromise($localize`:@@groupBackgroundImageDetails.groupUpdated:Group Updated!`))
            window.location.reload();
          })
          .catch(()=>{
            reject(utilityService.rejectAsyncPromise($localize`:@@groupBackgroundImageDetails.unableToUpdate:Unable to update the group!`))
          });
      }));
  }
}
