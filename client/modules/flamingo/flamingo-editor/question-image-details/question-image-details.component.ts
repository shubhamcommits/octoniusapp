import { Component, OnInit, Input, Injector } from '@angular/core';
import { SubSink } from 'subsink';
import { PublicFunctions } from 'modules/public.functions';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { FlamingoService } from 'src/shared/services/flamingo-service/flamingo.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-question-image-details',
  templateUrl: './question-image-details.component.html',
  styleUrls: ['./question-image-details.component.scss']
})
export class QuestionImageDetailsComponent implements OnInit {

  constructor(
    private injector: Injector
  ) { }

  // BaseUrl
  @Input('baseUrl') baseUrl: any;

  // Group Data
  @Input('groupId') groupId: any;

  @Input('flamingoId') flamingoId: any;

  @Input('activeQuestion') activeQuestion: any;

  
  FLAMINGO_UPLOADS = environment.FLAMINGO_BASE_URL+'/uploads/'
  // Cropped Image of the Input Image File
  croppedImage: File;

  // Unsubscribe the Data
  private subSink = new SubSink();

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector);

  ngOnInit() {
    console.log('sdsddf',this.activeQuestion);
  }

  /**
   * This function recieves the @Output from @module <app-crop-image></app-crop-image>
   * @param $event - as the cropped image File
   */
  getCroppedImage($event: File) {
    this.croppedImage = $event;
  }

  uploadImage() {

   // Flamingo Service
    let flamingoService = this.injector.get(FlamingoService);
    let utilityService = this.injector.get(UtilityService)

    utilityService.asyncNotification('Please wait while we are uploading the Question Image...',
      new Promise((resolve, reject) => {
        flamingoService.uploadQuestionImage(this.groupId, this.croppedImage,this.flamingoId,this.activeQuestion?._id)
        .then((res)=>{
          this.activeQuestion = res['question'];
          resolve(utilityService.resolveAsyncPromise('Question Image upload success!!!'))
        })
        .catch(()=>{
          reject(utilityService.rejectAsyncPromise('Unable to Question Image!'))
        })

      }))
  }
}
