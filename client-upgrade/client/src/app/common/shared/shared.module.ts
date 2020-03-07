import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageCropperModule } from 'ngx-image-cropper';

import { CropImageComponent } from './crop-image/crop-image.component';
import { EmailInputComponent } from './email-input/email-input.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { InfiniteScrollComponent } from './infinite-scroll/infinite-scroll.component';
import { ComponentSearchBarComponent } from './component-search-bar/component-search-bar.component';
import { BrandingPanelComponent } from './branding-panel/branding-panel.component';
import { RouterModule } from '@angular/router';
import { LoadingSpinnerSmallComponent } from './loading-spinner-small/loading-spinner-small.component';
import { SectionSeparatorComponent } from './section-separator/section-separator.component';
import { ComponentSearchInputBoxComponent } from './component-search-input-box/component-search-input-box.component';



@NgModule({
  declarations: [
    BrandingPanelComponent,
    CropImageComponent,
    EmailInputComponent,
    LoadingSpinnerComponent,
    InfiniteScrollComponent,
    ComponentSearchBarComponent,
    LoadingSpinnerSmallComponent,
    SectionSeparatorComponent,
    ComponentSearchInputBoxComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ImageCropperModule,
    RouterModule
  ], 
  exports: [
    BrandingPanelComponent,
    CropImageComponent,
    ComponentSearchBarComponent,
    ComponentSearchInputBoxComponent,
    EmailInputComponent,
    InfiniteScrollComponent,
    LoadingSpinnerComponent,
    LoadingSpinnerSmallComponent,
    SectionSeparatorComponent
  ]
})
export class SharedModule { }
