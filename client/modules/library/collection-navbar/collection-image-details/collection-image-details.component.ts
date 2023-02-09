import { Component, OnInit, Input, Injector } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { LibraryService } from 'src/shared/services/library-service/library.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-collection-image-details',
  templateUrl: './collection-image-details.component.html',
  styleUrls: ['./collection-image-details.component.scss']
})
export class CollectionImageDetailsComponent implements OnInit {

  @Input() collectionData: any;
  @Input() workspaceId: string;
  
  // Cropped Image of the Input Image File
  croppedImage: File;
  
  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector);
  
  constructor(
    private injector: Injector,
    private utilityService: UtilityService,
    private libraryService: LibraryService
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
    if (this.croppedImage) {
      this.utilityService.asyncNotification($localize`:@@collectionImageDetails.pleaseWaitWhileWeUpdate:Please wait while we are updating the collection avatar...`,
        new Promise((resolve, reject) => {
          this.libraryService.updateCollectionImage(this.workspaceId, this.collectionData?._id, this.croppedImage).then((res)=>{
            this.collectionData.collection_avatar = res['collection']['collection_avatar'];
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@collectionImageDetails.collectionAvatarUpdated:Collection Avatar Updated!`))
          })
          .catch((error)=>{
            reject(this.utilityService.rejectAsyncPromise($localize`:@@collectionImageDetails.unableToUpdateAvatar:Unable to update the collection avatar!`))
          });
        }));
    } else {
      this.utilityService.errorNotification($localize`:@@collectionImageDetails.noImageToUpload:Please, provide an image to upload!`);
    }
  }
}
