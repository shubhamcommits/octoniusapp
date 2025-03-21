import { Component, OnInit, EventEmitter, Output, ViewChild, Input } from '@angular/core';
import { base64ToFile, ImageCroppedEvent, ImageCropperComponent, ImageTransform } from 'ngx-image-cropper';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-crop-image',
  templateUrl: './crop-image.component.html',
  styleUrls: ['./crop-image.component.scss']
})
export class CropImageComponent implements OnInit {

  @Input() resizeToWidth = 0;
  @Input() cropperMinWidth = 0;

  // OUTPUT IMAGE EMITTER
  @Output('outputImage') outputImage = new EventEmitter();

  // IMAGE CROPPER COMPONENT
  @ViewChild(ImageCropperComponent) imageCropper: ImageCropperComponent;

  // INPUT IMAGE EVENT
  imageChangedEvent: Event;

  // CROPPED IMAGE
  croppedImage: any = '';

  canvasRotation = 0;
  transform: ImageTransform = {};
  translateH = 0;
  translateV = 0;

  constructor(
    private utilityService: UtilityService
  ) { }

  ngOnInit() {
  }

  /**
   * This function is responsible for taking image as the input and assigning it to the cropper
   * @param event
   */
  async fileChangeEvent(event: Event) {
    this.imageChangedEvent = event;
  }

  /**
   * This functions is resposible for giving the cropped output of the current image input
   * @param event
   * And Even emits the message to other components as well, with the @function outputImage()
   */
  async imageCropped(event: ImageCroppedEvent) {

    this.croppedImage = event.base64;

    // Convert the event Blob to File
    this.croppedImage = new File([base64ToFile(this.croppedImage)], this.imageChangedEvent.target['files'][0]['name'], { type: this.imageChangedEvent.target['files'][0]['type'] });

    // Emit the image
    this.outputImage.emit(this.croppedImage);
  }

  /**
   * This function checks if the image has been loaded or not
   */
  imageLoaded() {

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
    this.utilityService.errorNotification($localize`:@@cropImage.oopsFormatNotSupported:Oops, seems like the format is not supported, kindly use .png, .gif, or .jpg format images!`);
  }

  /**
   * This function rotates then image to the left
   */
  rotateLeft() {
    setTimeout(() => { // Use timeout because rotating image is a heavy operation and will block the ui thread
      this.canvasRotation--;
      this.flipAfterRotate();
    });
  }

  /**
   * This function rotates the image to the right
   */
  rotateRight() {
    setTimeout(() => {
      this.canvasRotation++;
      this.flipAfterRotate();
    });
  }

  private flipAfterRotate() {
    const flippedH = this.transform.flipH;
    const flippedV = this.transform.flipV;
    this.transform = {
      ...this.transform,
      flipH: flippedV,
      flipV: flippedH
    };
    this.translateH = 0;
    this.translateV = 0;
  }

  /**
   * This function flips the image horizontally
   */
  flipHorizontal() {
    this.transform = {
      ...this.transform,
      flipH: !this.transform.flipH
    };
  }

  /**
   * This function flips the image vertically
   */
  flipVertical() {
    this.transform = {
      ...this.transform,
      flipV: !this.transform.flipV
    };
  }

  /*
  rotateLeft() {
    this.imageCropper.rotateLeft();
  }

  rotateRight() {
    this.imageCropper.rotateRight();
  }

  flipHorizontal() {
    this.imageCropper.flipHorizontal();
  }

  flipVertical() {
    this.imageCropper.flipVertical();
  }
  */

  /**
   * This function is resposible for converting a data URI to Blob
   * @param dataURI
   */
  dataURItoBlob(dataURI: any) {

    // Calculate Byte String
    const byteString = window.atob(dataURI)

    // Create an Array Buffer
    const arrayBuffer = new ArrayBuffer(byteString.length)

    // Create Unit8Array
    const int8Array = new Uint8Array(arrayBuffer)

    // Encode the 8bit array
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i)
    }

    // Create the Blob from the int8Array
    const blob = new Blob([int8Array], { type: 'image/jpeg' })

    // Return the blob
    return blob
  }

  // Convert file to base64 string
  fileToBase64(file: File) {
    return new Promise(resolve => {
      // var file = new File([file);
      var reader = new FileReader();
      // Read file content on file loaded event
      reader.onload = function (event) {
        resolve(event['target']['result']);
      };

      // Convert data to base64
      reader.readAsDataURL(file);
    })
  }

  ngOnDestroy() {
  }

}
