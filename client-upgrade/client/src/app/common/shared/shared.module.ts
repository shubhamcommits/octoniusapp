import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageCropperModule } from 'ngx-image-cropper';
import { NgbTimepickerModule, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';

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
import { AttachFilesComponent } from './attach-files/attach-files.component';
import { AttachCloudFilesComponent } from './attach-cloud-files/attach-cloud-files.component';


@NgModule({
  declarations: [
    AttachFilesComponent,
    AttachCloudFilesComponent,
    BrandingPanelComponent,
    CropImageComponent,
    DatePickerComponent,
    EmailInputComponent,
    LoadingSpinnerComponent,
    InfiniteScrollComponent,
    ComponentSearchBarComponent,
    LoadingSpinnerSmallComponent,
    SectionSeparatorComponent,
    ComponentSearchInputBoxComponent,
    QuillEditorComponent,
    TimePickerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ImageCropperModule,
    RouterModule,

    // ANGULAR BOOTSTRAP DATE PICKER MODULE
    NgbDatepickerModule,

    // ANGULAR BOOTSTRAP TIME PICKER MODULE
    NgbTimepickerModule,

  ],
  exports: [
    AttachFilesComponent,
    AttachCloudFilesComponent,
    BrandingPanelComponent,
    CropImageComponent,
    ComponentSearchBarComponent,
    ComponentSearchInputBoxComponent,
    DatePickerComponent,
    EmailInputComponent,
    InfiniteScrollComponent,
    LoadingSpinnerComponent,
    LoadingSpinnerSmallComponent,
    SectionSeparatorComponent,
    QuillEditorComponent,
    TimePickerComponent
  ]
})
export class SharedModule { }
