import { Component, OnInit, Input, Injector, Inject, EventEmitter, Output } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';
import { LoungeService } from 'src/shared/services/lounge-service/lounge.service';
import { environment } from 'src/environments/environment';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-lounge-image-update',
  templateUrl: './lounge-image-update.component.html',
  styleUrls: ['./lounge-image-update.component.scss']
})
export class LoungeImageUpdateComponent implements OnInit {

  @Output() elementImageUpdatedEvent = new EventEmitter();

  // Lounge Data Data Variable
  elementData: any;
  elementPropertyName: string = '';

  // Base Url of the Application
  baseUrl = environment.UTILITIES_WORKSPACES_UPLOADS;

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private mdDialogRef: MatDialogRef<LoungeImageUpdateComponent>,
    private utilityService: UtilityService,
    private loungeService: LoungeService,
    private injector: Injector,
  ) { }

  ngOnInit() {
    this.elementData = this.data.elementData;
    this.elementPropertyName = this.data.elementPropertyName;
  }

  /**
   * This function unsubscribes the data from the observables
   */
  ngOnDestroy(): void {

  }

  /**
   * @param $event - as the image File
   */
  imageChangeEvent(files: FileList) {
    const image = files.item(0);
    const newFile = new File([image], image.name.replace(/\s/g, "_"), {type: image.type});
    this.updateImage(newFile);
  }

  /**
   * This function updates the workspace data
   * @param workspaceId
   * @param workspaceAvatar
   */
  async updateImage(image: File) {
    try {
      this.utilityService.asyncNotification($localize`:@@loungeImageUpdate.pleaseWaitWhileWeUpdate:Please wait while we are updating the image for you...`,
        new Promise((resolve, reject) => {
          this.loungeService.updateImage(this.elementData?._workspace, this.elementData?._id, image, this.elementPropertyName, this.elementData?.type)
            .then((res) => {
              this.elementData[this.elementPropertyName] = res['element'][this.elementPropertyName];
              this.elementImageUpdatedEvent.emit(this.elementData);
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@loungeImageUpdate.imageUpdated:Image updated!`));
              this.onCloseDialog();
            }).catch((err) => {
              console.log('Error occurred, while updating the image', err);
              reject(this.utilityService.rejectAsyncPromise($localize`:@@loungeImageUpdate.oopsAnErrorOccured:Oops, an error occurred while updating the image, please try again!`))
            });
        }));
    } catch (err) {
      console.log('There\'s some unexpected error occurred, please try again!', err);
      this.utilityService.errorNotification($localize`:@@loungeImageUpdate.unexpectedError:There\'s some unexpected error occurred, please try again!`);
    }
  }

  onCloseDialog() {
    this.mdDialogRef.close();
  }
}
