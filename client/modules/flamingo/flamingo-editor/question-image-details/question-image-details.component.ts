import { Component, OnInit, Input,Output, EventEmitter, ViewChild,  Injector } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
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
  
  @Input('workspaceId') workspaceId: any;
  
  // Emitter to notify that the view is changing
  @Output() uploadImageEmitter: EventEmitter<any> = new EventEmitter<any>();

  
  FLAMINGO_UPLOADS = environment.FLAMINGO_BASE_URL+'/uploads/'
  
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

  uploadImage() {

   // Flamingo Service
    let flamingoService = this.injector.get(FlamingoService);
    let utilityService = this.injector.get(UtilityService)

    utilityService.asyncNotification('Please wait while we are uploading the Question Image...',
      new Promise((resolve, reject) => {
        flamingoService.uploadQuestionImage(this.groupId, this.croppedImage,this.flamingoId,this.activeQuestion?._id, this.workspaceId)
        .then((res)=>{

          this.activeQuestion = res['question'];

          this.uploadImageEmitter.emit(res['question']);
          utilityService.closeAllModals();
          resolve(utilityService.resolveAsyncPromise('Question Image upload success!!!'))
        })
        .catch(()=>{
          reject(utilityService.rejectAsyncPromise('Unable to Question Image!'))
        })

      }))
  }
}
