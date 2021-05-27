import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageCropperModule } from 'ngx-image-cropper';
import { NgbTimepickerModule, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

// import { QuicklinkModule } from 'ngx-quicklink';

import { NgbModalModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { SafePipe } from 'src/shared/pipes/safe.pipe';

import { CropImageComponent } from './crop-image/crop-image.component';
import { EmailInputComponent } from './email-input/email-input.component';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { ComponentSearchBarComponent } from './component-search-bar/component-search-bar.component';
import { RouterModule } from '@angular/router';
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
import { SelectAssigneeComponent } from './select-assignee/select-assignee.component';
import { TaskStatusComponent } from './posts/post-actions/task-status/task-status.component';
import { ChangeColumnComponent } from './posts/post-actions/change-column/change-column.component';
import { PostTagsComponent } from './posts/post-tags/post-tags.component';
import { InfiniteScrollComponent } from './infinite-scroll/infinite-scroll.component';
import { ProgressBarComponent } from './progress-bar/progress-bar.component';
import { SelectMemberComponent } from './select-member/select-member.component';
import { ActivityFeedComponent } from './activity-feed/activity-feed.component';
import { NewsPillComponent } from './activity-feed/news-pill/news-pill.component';
import { GroupTaskProgressComponent } from './activity-feed/group-task-progress/group-task-progress.component';
import { GroupInformationComponent } from './activity-feed/group-information/group-information.component';
import { SendPulseComponent } from './activity-feed/send-pulse/send-pulse.component';
import { GroupActivityFeedComponent } from './activity-feed/group-activity-feed/group-activity-feed.component';
import { GroupPostboxComponent } from './activity-feed/group-postbox/group-postbox.component';
import { GroupPostSelectionComponent } from './activity-feed/group-postbox/group-post-selection/group-post-selection.component';
import { GroupCreatePostComponent } from './activity-feed/group-postbox/group-create-post/group-create-post.component';
import { TaskSmartCardComponent } from './activity-feed/task-smart-card/task-smart-card.component';
import { AgendaSmartCardComponent } from './activity-feed/agenda-smart-card/agenda-smart-card.component';
import { GroupUpdateInformationComponent } from './activity-feed/group-information/group-update-information/group-update-information.component';
import { CommentSectionComponent } from './comments/comment-section/comment-section.component';
import { PostCommentComponent } from './comments/post-comment/post-comment.component';
import { LikeCommentComponent } from './comments/post-comment/like-comment/like-comment.component';
import { NorthStarComponent } from './activity-feed/group-postbox/group-create-post-dialog-component/north-star/north-star.component';
import { NorthStarStatsComponent } from './activity-feed/group-postbox/group-create-post-dialog-component/north-star/stats/north-star-stats.component';

import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {MatExpansionModule} from '@angular/material/expansion';

import { PreviewFilesDialogComponent } from './preview-files-dialog/preview-files-dialog.component';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { InlineInputComponent } from './inline-input/inline-input.component';
import { GroupCreatePostDialogComponent } from './activity-feed/group-postbox/group-create-post-dialog-component/group-create-post-dialog-component.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MomentDateModule } from '@angular/material-moment-adapter';
import { TruncateTextPipe } from 'src/shared/pipes/truncate-text.pipe';
import { ChartsModule, ThemeService } from 'ng2-charts';

import { ResizableModule } from 'angular-resizable-element';
import { ProjectStatusComponent } from './activity-feed/project-status/project-status.component';

import { WorkStatisticsCardComponent } from './dashboard/work-statistics-card/work-statistics-card.component';
import { WorkloadCardComponent } from './dashboard/workload-card/workload-card.component';
import { VelocityCardComponent } from './dashboard/velocity-card/velocity-card.component';
import { PulseCardComponent } from './dashboard/pulse-card/pulse-card.component';
import { PeopleDirectoryCardComponent } from './dashboard/people-directory-card/people-directory-card.component';
import { OrganizationalStructureCardComponent } from './dashboard/organizational-structure-card/organizational-structure-card.component';
import { EngagementCardComponent } from './dashboard/engagement-card/engagement-card.component';
import { GlobalPerformanceCardComponent } from './dashboard/global-performance-card/global-performance-card.component';
import { NewTaskComponent } from './posts/new-task/new-task.component';
import { SubtasksComponent } from './activity-feed/group-postbox/group-create-post-dialog-component/subtasks/subtasks.component';
import { TaskActionsComponent } from './activity-feed/group-postbox/group-create-post-dialog-component/task-actions/task-actions.component';
import { MultipleAssignmentsComponent } from './posts/multiple-assignments/multiple-assignments.component';
import { HighlightDirective } from './posts/multiple-assignments/highlight.directive';
import { FilterPipe } from './posts/multiple-assignments/filter.pipe';
import { AssigneeAvatarComponent } from './assignee-avatar/assignee-avatar.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CommentListComponent } from './comments/comment-list/comment-list.component';
import { MemberListMenuComponent } from './member-list-menu/member-list-menu.component';
import { MembersWorkloadCardComponent } from './dashboard/members-workload-card/members-workload-card.component';
import { SectionStatusCardComponent } from './dashboard/section-status-card/section-status-card.component';
import { MemberDialogComponent } from './member-dialog/member-dialog.component';

import { UserUpdateProfileDialogComponent } from './user-update-profile-dialog/user-update-profile-dialog.component';
import { UserUpdateUserInformationDialogComponent } from './user-update-user-information-dialog/user-update-user-information-dialog.component';
import { UserUpdateUserPersonalInformationDialogComponent } from './user-update-user-personal-information-dialog/user-update-user-personal-information-dialog.component';
import { SecuredImageComponent } from './secured-image/secured-image.component';
import { ProjectBudgetDialogComponent } from './project-budget-dialog/project-budget-dialog.component';
import { KpiPerformanceCardComponent } from './dashboard/kpi-performance-card/kpi-performance-card.component';
import { ProjectStatisticsComponent } from './dashboard/kpi-performance-card/project-statistics/project-statistics.component';
import { ProjectBudgetComponent } from './dashboard/kpi-performance-card/project-budget/project-budget.component';

@NgModule({
  declarations: [
    AttachFilesComponent,
    AttachCloudFilesComponent,
    CropImageComponent,
    DatePickerComponent,
    EmailInputComponent,
    LoadingSpinnerComponent,
    ComponentSearchBarComponent,
    SectionSeparatorComponent,
    SecuredImageComponent,
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
    TruncateTextPipe,

    SelectAssigneeComponent,

    TaskStatusComponent,

    ChangeColumnComponent,

    PostTagsComponent,

    InfiniteScrollComponent,

    ProgressBarComponent,

    SelectMemberComponent,

    ActivityFeedComponent,

    SendPulseComponent,

    ProjectStatusComponent,

    GroupInformationComponent,

    GroupTaskProgressComponent,

    NewsPillComponent,

    GroupActivityFeedComponent,

    GroupPostboxComponent,

    GroupPostSelectionComponent,

    GroupCreatePostComponent,

    TaskSmartCardComponent,

    AgendaSmartCardComponent,

    GroupUpdateInformationComponent,

    PostCommentComponent,

    CommentSectionComponent,

    LikeCommentComponent,

    PreviewFilesDialogComponent,

    InlineInputComponent,

    NorthStarComponent,
    NorthStarStatsComponent,

    GroupCreatePostDialogComponent,

    WorkStatisticsCardComponent,
    WorkloadCardComponent,
    VelocityCardComponent,
    PulseCardComponent,
    PeopleDirectoryCardComponent,
    OrganizationalStructureCardComponent,
    EngagementCardComponent,
    GlobalPerformanceCardComponent,
    KpiPerformanceCardComponent,
    ProjectStatisticsComponent,
    ProjectBudgetComponent,
    MembersWorkloadCardComponent,
    SectionStatusCardComponent,

    NewTaskComponent,

    SubtasksComponent,

    TaskActionsComponent,

    MultipleAssignmentsComponent,

    HighlightDirective,
    FilterPipe,

    AssigneeAvatarComponent,
    CommentListComponent,
    MemberListMenuComponent,
    MemberDialogComponent,
    UserUpdateProfileDialogComponent,
    UserUpdateUserInformationDialogComponent,
    UserUpdateUserPersonalInformationDialogComponent,
    ProjectBudgetDialogComponent
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

    // Preloading Routes Module
    // QuicklinkModule,

    // ANGULAR BOOTSTRAP MODAL MODULE
    NgbModalModule,

    // ANGULAR TOOLTIP MODULE
    NgbTooltipModule,

    // MAT SIDE MODULE
    MatSidenavModule,

    // Angular Material Dialog
    MatDialogModule,

    NgxDocViewerModule,

    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MomentDateModule,
    MatSlideToggleModule,
    ChartsModule,
    ResizableModule,
    MatMenuModule,
    MatBadgeModule,
    MatPaginatorModule,
    MatExpansionModule
  ],
  exports: [
    AttachFilesComponent,
    AttachCloudFilesComponent,
    CropImageComponent,
    ComponentSearchBarComponent,
    ComponentSearchInputBoxComponent,
    DatePickerComponent,
    EmailInputComponent,
    LoadingSpinnerComponent,
    PostViewComponent,
    PostTagsComponent,
    SectionSeparatorComponent,
    SecuredImageComponent,
    SelectAssigneeComponent,
    QuillEditorComponent,
    TimePickerComponent,
    TaskStatusComponent,
    ChangeColumnComponent,
    InfiniteScrollModule,
    // QuicklinkModule,
    InfiniteScrollComponent,
    ProgressBarComponent,
    SelectMemberComponent,
    SendPulseComponent,
    ProjectStatusComponent,

    GroupInformationComponent,

    GroupTaskProgressComponent,

    NewsPillComponent,

    GroupActivityFeedComponent,

    GroupPostboxComponent,

    GroupPostSelectionComponent,

    GroupCreatePostComponent,

    ActivityFeedComponent,

    TaskSmartCardComponent,

    AgendaSmartCardComponent,

    NgbTooltipModule,

    NgbModalModule,

    LikeCommentComponent,

    MatSidenavModule,
    InlineInputComponent,
    GroupCreatePostDialogComponent,
    TruncateTextPipe,
    SafePipe,
    ChartsModule,

    WorkStatisticsCardComponent,
    WorkloadCardComponent,
    VelocityCardComponent,
    PulseCardComponent,
    PeopleDirectoryCardComponent,
    OrganizationalStructureCardComponent,
    EngagementCardComponent,
    GlobalPerformanceCardComponent,
    KpiPerformanceCardComponent,
    ProjectStatisticsComponent,
    ProjectBudgetComponent,
    MembersWorkloadCardComponent,
    SectionStatusCardComponent,

    NewTaskComponent,

    SubtasksComponent,

    TaskActionsComponent,

    MultipleAssignmentsComponent,
    AssigneeAvatarComponent,
    CommentListComponent,
    MemberListMenuComponent,
    MemberDialogComponent,
    UserUpdateUserInformationDialogComponent,
    UserUpdateProfileDialogComponent,
    UserUpdateUserPersonalInformationDialogComponent,
    ProjectBudgetDialogComponent
  ],
  providers: [
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: false } },
    ThemeService,
    DatePipe
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  entryComponents: [
    PreviewFilesDialogComponent,
    GroupCreatePostDialogComponent,
    MemberDialogComponent,
    UserUpdateProfileDialogComponent,
    UserUpdateUserInformationDialogComponent,
    UserUpdateUserPersonalInformationDialogComponent,
    ProjectBudgetDialogComponent
  ]
})
export class SharedModule { }
