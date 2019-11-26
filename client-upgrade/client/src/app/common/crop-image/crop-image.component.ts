import { Component, OnInit, EventEmitter, Output, ViewChild } from '@angular/core';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-crop-image',
  templateUrl: './crop-image.component.html',
  styleUrls: ['./crop-image.component.scss']
})
export class CropImageComponent implements OnInit {

  constructor(private utilityService: UtilityService) { }

  // OUTPUT IMAGE EMITTER
  @Output('outputImage') outputImage = new EventEmitter();

  // INPUT IMAGE EVENT
  imageChangedEvent: Event;

  // CROPPED IMAGE
  croppedImage: any = '';

  // IMAGE CROPPER COMPONENT
  @ViewChild(ImageCropperComponent, {static: false}) imageCropper: ImageCropperComponent;

  ngOnInit() {
  }

  /**
   * This function is responsible for taking image as the input and assigning it to the cropper
   * @param event 
   */
  async fileChangeEvent(event: Event) {
    
    // START LOADING THE IMAGE
    this.utilityService.startBackgroundLoader();
    this.imageChangedEvent = event;
  }

  /**
   * This functions is resposible for giving the cropped output of the current image input
   * @param event 
   * And Even emits the message to other components as well, with the @function outputImage()
   */
  imageCropped(event: ImageCroppedEvent) {
    
    this.croppedImage = event.file;

    // CREATING A FILE READER FOR CONVERTING THE INPUT
    let fileReader = new FileReader();
    fileReader.readAsDataURL(this.croppedImage);

    this.croppedImage = new File([this.croppedImage], "-workspace-avatar.jpg", { type: this.croppedImage.type });

    this.outputImage.emit(this.croppedImage);
  }

  /**
   * This function checks if the image has been loaded or not
   */
  imageLoaded() {
    
    // SHOW CROPPER AND STOP LOADING PROCESS
    this.utilityService.stopBackgroundLoader();
  }

  /**
   * This function checks if the cropper is ready or not
   */
  cropperReady() {
    // cropper ready
  }

  /**
   * This function checks if the input image has failed to load
   */
  loadImageFailed() {
    this.utilityService.errorNotification('Oops, seems like the format is not supported, kindly use .png, .gif, or .jpg format images!');
    this.utilityService.stopBackgroundLoader();
  }


  /**
   * This function rotates then image to the left
   */
  rotateLeft(){
    this.utilityService.startBackgroundLoader();
    this.imageCropper.rotateLeft();
  }

  /**
   * This function rotates the image to the right
   */
  rotateRight(){
    this.utilityService.startBackgroundLoader();
    this.imageCropper.rotateRight();
  }

  /**
   * This function flips the image horizontally
   */
  flipHorizontal(){
    this.utilityService.startBackgroundLoader();
    this.imageCropper.flipHorizontal();
  }

  /**
   * This function flips the image vertically
   */
  flipVertical(){
    this.utilityService.startBackgroundLoader();
    this.imageCropper.flipVertical();
  }
}
