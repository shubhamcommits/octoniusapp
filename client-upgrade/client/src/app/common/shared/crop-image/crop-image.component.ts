import { Component, OnInit, EventEmitter, Output, ViewChild } from '@angular/core';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { NgxImageCompressService } from 'ngx-image-compress';

@Component({
  selector: 'app-crop-image',
  templateUrl: './crop-image.component.html',
  styleUrls: ['./crop-image.component.scss']
})
export class CropImageComponent implements OnInit {

  constructor(
    private utilityService: UtilityService,
    private imageCompressService: NgxImageCompressService
  ) { }

  // OUTPUT IMAGE EMITTER
  @Output('outputImage') outputImage = new EventEmitter();

  // INPUT IMAGE EVENT
  imageChangedEvent: Event;

  // CROPPED IMAGE
  croppedImage: any = '';

  // IMAGE CROPPER COMPONENT
  @ViewChild(ImageCropperComponent, { static: false }) imageCropper: ImageCropperComponent;

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
  async imageCropped(event: ImageCroppedEvent) {

    this.croppedImage = event.file;

    // CREATING A FILE READER FOR CONVERTING THE INPUT
    let fileReader = new FileReader();
    fileReader.readAsDataURL(this.croppedImage);

    // this.croppedImage = await this.compressFile(event.base64, 'abc')

    // Convert the event Blob to File
    // this.croppedImage = new File([this.croppedImage], "-avatar.jpg", { type: this.croppedImage.type });

    // console.log(event.file, this.croppedImage)

    // // Convert the File to base 64
    // let base64image = await this.fileToBase64(this.croppedImage)

    // // Compress the image
    // this.croppedImage = await this.compressFile(base64image, this.croppedImage['name'])

    console.log('cropped', this.imageChangedEvent)

    // Emit the image
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
  rotateLeft() {
    this.utilityService.startBackgroundLoader();
    this.imageCropper.rotateLeft();
  }

  /**
   * This function rotates the image to the right
   */
  rotateRight() {
    this.utilityService.startBackgroundLoader();
    this.imageCropper.rotateRight();
  }

  /**
   * This function flips the image horizontally
   */
  flipHorizontal() {
    this.utilityService.startBackgroundLoader();
    this.imageCropper.flipHorizontal();
  }

  /**
   * This function flips the image vertically
   */
  flipVertical() {
    this.utilityService.startBackgroundLoader();
    this.imageCropper.flipVertical();
  }

  /**
   * This function is responsible for compressing an image
   * @param image 
   * @param fileName 
   */
  compressFile(image: any, fileName: string) {

    return new Promise((resolve) => {
      
      // Orientation variable
      let orientation = -2;

      // Size of original Image
      let sizeOfOriginalImage = this.imageCompressService.byteCount(image) / (1024 * 1024)

      // console.warn('Size in Mega bytes is now:', sizeOfOriginalImage)

      console.log(image)

      // Compress the image file
      this.imageCompressService.compressFile(image, orientation, 50, 50)
        .then((result) => {

          // Calculate size of compressed image
          let sizeOFCompressedImage = this.imageCompressService.byteCount(result) / (1024 * 1024)

          // console.warn('Size in Meag bytes after compression:', sizeOFCompressedImage);

          console.log(result)

          // create file from byte
          const imageName = fileName

          // call method that creates a blob from dataUri
          const imageBlob = this.dataURItoBlob(result.split(',')[1])

          //imageFile created below is the new compressed file which can be send to API in form data
          const imageFile = new File([image], imageName, { type: image.type })

          // Resolve the Compressed Image data
          resolve({
            blob: imageBlob,
            file: imageFile
          })
        })
    })

  }

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

  ngOnDestroy(){
    this.utilityService.stopAllLoader();
  }

}
