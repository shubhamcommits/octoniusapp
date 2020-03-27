import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';
import { ImageCropperModule } from 'ngx-image-cropper';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';

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
import { QuillEditorComponent } from './quill-editor/quill-editor.component';
import { DatePickerComponent } from './date-picker/date-picker.component';
import { TimePickerComponent } from './time-picker/time-picker.component';


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
    ComponentSearchInputBoxComponent,
    QuillEditorComponent,
    DatePickerComponent,
    TimePickerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ImageCropperModule,
    RouterModule,
    OverlayModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
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
    SectionSeparatorComponent,
    QuillEditorComponent
  ]
})
export class SharedModule { }
