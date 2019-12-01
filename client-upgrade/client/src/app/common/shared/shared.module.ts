import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ImageCropperModule } from 'ngx-image-cropper';

import { CropImageComponent } from './crop-image/crop-image.component';
import { EmailInputComponent } from './email-input/email-input.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';



@NgModule({
  declarations: [
    CropImageComponent,
    EmailInputComponent,
    LoadingSpinnerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ImageCropperModule
  ], 
  exports: [
    CropImageComponent,
    EmailInputComponent,
    LoadingSpinnerComponent
  ]
})
export class SharedModule { }
