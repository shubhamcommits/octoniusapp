import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageCropperModule } from 'ngx-image-cropper';
import { NgbTimepickerModule, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { SafePipe } from 'src/shared/pipes/safe.pipe';

import { CropImageComponent } from './crop-image/crop-image.component';
import { EmailInputComponent } from './email-input/email-input.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
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
import { PostViewComponent } from './posts/post-view/post-view.component';
import { PostActionsComponent } from './posts/post-actions/post-actions.component';
import { LikePostComponent } from './posts/post-actions/like-post/like-post.component';
import { CommentOnPostComponent } from './posts/post-actions/comment-on-post/comment-on-post.component';
import { FollowPostComponent } from './posts/post-actions/follow-post/follow-post.component';
import { PostUtilsComponent } from './posts/post-actions/post-utils/post-utils.component';
import { PostEditComponent } from './posts/post-edit/post-edit.component';
import { SelectAssigneeComponent } from './select-assignee/select-assignee.component';


@NgModule({
  declarations: [
    AttachFilesComponent,
    AttachCloudFilesComponent,
    BrandingPanelComponent,
    CropImageComponent,
    DatePickerComponent,
    EmailInputComponent,
    LoadingSpinnerComponent,
    ComponentSearchBarComponent,
    LoadingSpinnerSmallComponent,
    SectionSeparatorComponent,
    ComponentSearchInputBoxComponent,
    QuillEditorComponent,
    TimePickerComponent,
    PostViewComponent,
    PostActionsComponent,
    LikePostComponent,
    CommentOnPostComponent,
    FollowPostComponent,
    PostUtilsComponent,

    // Safe Pipe
    SafePipe,

    PostEditComponent,

    SelectAssigneeComponent
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

    // Infinite Scroll Module
    InfiniteScrollModule,

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
    LoadingSpinnerComponent,
    LoadingSpinnerSmallComponent,
    PostViewComponent,
    PostEditComponent,
    SectionSeparatorComponent,
    SelectAssigneeComponent,
    QuillEditorComponent,
    TimePickerComponent,
    InfiniteScrollModule
  ]
})
export class SharedModule { }
