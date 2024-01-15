import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageCropperModule } from 'ngx-image-cropper';

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
import { TagsComponent } from './tags/tags.component';
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
import { GroupPostComponent } from './activity-feed/group-postbox/group-post/group-post.component';
import { TaskSmartCardComponent } from './activity-feed/task-smart-card/task-smart-card.component';
import { AgendaSmartCardComponent } from './activity-feed/agenda-smart-card/agenda-smart-card.component';
import { GroupUpdateInformationComponent } from './activity-feed/group-information/group-update-information/group-update-information.component';
import { CommentSectionComponent } from './comments/comment-section/comment-section.component';
import { PostCommentComponent } from './comments/post-comment/post-comment.component';
import { LikeCommentComponent } from './comments/post-comment/like-comment/like-comment.component';
import { NorthStarComponent } from './posts/group-post-dialog/north-star/north-star.component';
import { NorthStarStatsComponent } from './posts/group-post-dialog/north-star/stats/north-star-stats.component';

import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';

import { PreviewFilesDialogComponent } from './preview-files-dialog/preview-files-dialog.component';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { InlineInputComponent } from './inline-input/inline-input.component';
import { GroupPostDialogComponent } from './posts/group-post-dialog/group-post-dialog.component';
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
import { SubtasksComponent } from './posts/group-post-dialog/subtasks/subtasks.component';
import { TaskActionsComponent } from './posts/group-post-dialog/task-actions/task-actions.component';
import { MultipleAssignmentsComponent } from './posts/multiple-assignments/multiple-assignments.component';
import { FilterPipe } from '../../../shared/pipes/filter.pipe';
import { AssigneeAvatarComponent } from './assignee-avatar/assignee-avatar.component';
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
import { CustomToolTipComponent } from './custom-tool-tip/custom-tool-tip.component';
import { ToolTipRendererDirective } from './custom-tool-tip/tool-tip-renderer.directive';
import { WidgetSelectorDialogComponent } from './dashboard/widget-selector-dialog/widget-selector-dialog.component';
import { ColorPickerDialogComponent } from './color-picker-dialog/color-picker-dialog.component';
import { IdeaActionsComponent } from './posts/post-actions/idea-actions/idea-actions.component';
import { ActivityFiltersComponent } from './activity-feed/activity-filters/activity-filters.component';
import { SheetComponent } from './sheet/sheet.component';

// Material All Components Module
import { MaterialModule } from '../material-module/material-module.module';

// Charts Module
import { ChartModule } from 'modules/chart/chart.module';
import { CustomFieldStatisticsCardComponent } from './dashboard/custom-field-statistics-card/custom-field-statistics-card.component';
import { CustomFieldTableCardComponent } from './dashboard/custom-field-table-card/custom-field-table-card.component';
import { CustomFieldsTableSettingsDialogComponent } from './dashboard/custom-field-table-card/custom-fields-table-settings-dialog/custom-fields-table-settings-dialog.component';
import { ShuttleTaskComponent } from './posts/group-post-dialog/shuttle-task/shuttle-task.component';
import { FileDetailsDialogComponent } from './file-details-dialog/file-details-dialog.component';
import { ApprovalActionsComponent } from './approvals/approval-actions/approval-actions.component';
import { ApprovalsHistoryComponent } from './approvals/approvals-history/approvals-history.component';
import { PostDatesComponent } from './posts/group-post-dialog/post-dates/post-dates.component';
import { MatMenuModule } from '@angular/material/menu';
import { FileVersionsComponent } from './file-versions/file-versions.component';
import { SelectLanguageComponent } from './select-language/select-language.component';
import { PostLogsComponent } from './posts/group-post-dialog/post-logs/post-logs.component';
import { HighlightDirective } from 'src/shared/pipes/highlight.directive';
import { DebounceClickDirective } from 'src/shared/pipes/debounce-click.directive';
import { TopSocialCardComponent } from './dashboard/top-social-card/top-social-card.component';
import { HiveReportsCardComponent } from './hr/hive-reports-card/hive-reports-card.component';
import { PayrollSetupCardComponent } from './hr/payroll-setup-card/payroll-setup-card.component';
import { PendingTasksCardComponent } from './hr/pending-tasks-card/pending-tasks-card.component';
import { TimeOffCardComponent } from './hr/time-off-card/time-off-card.component';
import { ProgressBarColor } from 'src/shared/pipes/progress-bar-color.directive';
import { CountrySelectComponent } from './country-select/country-select.component';
import { UserWorkloadCalendarComponent } from './user-workload-calendar/user-workload-calendar.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { GlobalNorthStarDialogComponent } from './posts/global-north-star-dialog/global-north-star-dialog.component';
import { GlobalNorthStarStatsComponent } from './posts/global-north-star-dialog/stats/global-north-star-stats.component';
import { LikedByDialogComponent } from './liked-by-dialog/liked-by-dialog.component';
import { ShareCollectionDialogComponent } from './share-collection-dialog/share-collection-dialog.component';
import { PasswordStrengthComponent } from './password-strength/password-strength.component';
import { PricingTableComponent } from './pricing-table/pricing-table.component';
import { HolidayRejectionDialogComponent } from './hr/holiday-rejection-dialog/holiday-rejection-dialog.component';
import { CRMLeadCardComponent } from './posts/group-post-dialog/crm-lead-card/crm-lead-card.component';
import { CRMContactListComponent } from './crm/crm-contact-list/crm-contact-list.component';
import { CRMCompanyListComponent } from './crm/crm-company-list/crm-company-list.component';

@NgModule({
    declarations: [
        HighlightDirective,
        DebounceClickDirective,
        ProgressBarColor,
        ToolTipRendererDirective,
        FilterPipe,
        SafePipe,
        TruncateTextPipe,
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
        CountrySelectComponent,
        QuillEditorComponent,
        TimePickerComponent,
        PostViewComponent,
        PostActionsComponent,
        LikePostComponent,
        IdeaActionsComponent,
        CommentOnPostComponent,
        FollowPostComponent,
        PostUtilsComponent,
        SelectAssigneeComponent,
        TaskStatusComponent,
        ChangeColumnComponent,
        TagsComponent,
        InfiniteScrollComponent,
        ProgressBarComponent,
        SelectLanguageComponent,
        SelectMemberComponent,
        ActivityFeedComponent,
        SendPulseComponent,
        ActivityFiltersComponent,
        ProjectStatusComponent,
        GroupInformationComponent,
        GroupTaskProgressComponent,
        NewsPillComponent,
        GroupActivityFeedComponent,
        GroupPostboxComponent,
        GroupPostSelectionComponent,
        GroupPostComponent,
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
        GroupPostDialogComponent,
        GlobalNorthStarDialogComponent,
        GlobalNorthStarStatsComponent,
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
        CustomFieldStatisticsCardComponent,
        CustomFieldTableCardComponent,
        TopSocialCardComponent,
        NewTaskComponent,
        SubtasksComponent,
        TaskTimeTrackingComponent,
        TaskTimeTrackingListComponent,
        TaskActionsComponent,
        ShuttleTaskComponent,
        MultipleAssignmentsComponent,
        AssigneeAvatarComponent,
        CommentListComponent,
        MemberListMenuComponent,
        MemberDialogComponent,
        UserUpdateProfileDialogComponent,
        UserUpdateUserInformationDialogComponent,
        UserUpdateUserPersonalInformationDialogComponent,
        ProjectBudgetDialogComponent,
        CustomToolTipComponent,
        WidgetSelectorDialogComponent,
        CustomFieldsTableSettingsDialogComponent,
        ColorPickerDialogComponent,
        SheetComponent,
        FileDetailsDialogComponent,
        ApprovalActionsComponent,
        ApprovalsHistoryComponent,
        PostDatesComponent,
        FileVersionsComponent,
        PostLogsComponent,
        CRMLeadCardComponent,
        HiveReportsCardComponent,
        PayrollSetupCardComponent,
        PendingTasksCardComponent,
        TimeOffCardComponent,
        UserWorkloadCalendarComponent,
        LikedByDialogComponent,
        ShareCollectionDialogComponent,
        PasswordStrengthComponent,
        PricingTableComponent,
        HolidayRejectionDialogComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        ImageCropperModule,
        RouterModule,
        NgxDocViewerModule,
        MomentDateModule,
        ChartsModule,
        ResizableModule,
        MatMenuModule,
        MaterialModule,
        ChartModule,
        CalendarModule.forRoot({
            provide: DateAdapter,
            useFactory: adapterFactory
        })
    ],
    exports: [
        HighlightDirective,
        DebounceClickDirective,
        ProgressBarColor,
        TruncateTextPipe,
        SafePipe,
        FilterPipe,
        AttachFilesComponent,
        AttachCloudFilesComponent,
        CropImageComponent,
        ComponentSearchBarComponent,
        ComponentSearchInputBoxComponent,
        CountrySelectComponent,
        DatePickerComponent,
        EmailInputComponent,
        LoadingSpinnerComponent,
        PostViewComponent,
        TagsComponent,
        SectionSeparatorComponent,
        SecuredImageComponent,
        SelectAssigneeComponent,
        QuillEditorComponent,
        TimePickerComponent,
        TaskStatusComponent,
        ChangeColumnComponent,
        InfiniteScrollComponent,
        ProgressBarComponent,
        SelectLanguageComponent,
        SelectMemberComponent,
        SendPulseComponent,
        ActivityFiltersComponent,
        ProjectStatusComponent,
        GroupInformationComponent,
        GroupTaskProgressComponent,
        NewsPillComponent,
        GroupActivityFeedComponent,
        GroupPostboxComponent,
        GroupPostSelectionComponent,
        GroupPostComponent,
        ActivityFeedComponent,
        TaskSmartCardComponent,
        AgendaSmartCardComponent,
        LikeCommentComponent,
        MatSidenavModule,
        InlineInputComponent,
        GroupPostDialogComponent,
        GlobalNorthStarDialogComponent,
        GlobalNorthStarStatsComponent,
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
        CustomFieldStatisticsCardComponent,
        CustomFieldTableCardComponent,
        TopSocialCardComponent,
        NewTaskComponent,
        SubtasksComponent,
        TaskTimeTrackingComponent,
        TaskTimeTrackingListComponent,
        TaskActionsComponent,
        ShuttleTaskComponent,
        MultipleAssignmentsComponent,
        AssigneeAvatarComponent,
        CommentListComponent,
        MemberListMenuComponent,
        MemberDialogComponent,
        UserUpdateUserInformationDialogComponent,
        UserUpdateProfileDialogComponent,
        UserUpdateUserPersonalInformationDialogComponent,
        ProjectBudgetDialogComponent,
        MatTooltipModule,
        CustomToolTipComponent,
        WidgetSelectorDialogComponent,
        CustomFieldsTableSettingsDialogComponent,
        ColorPickerDialogComponent,
        FileDetailsDialogComponent,
        SheetComponent,
        MaterialModule,
        CommentSectionComponent,
        ApprovalActionsComponent,
        ApprovalsHistoryComponent,
        PostDatesComponent,
        FileVersionsComponent,
        PostLogsComponent,
        CRMLeadCardComponent,
        HiveReportsCardComponent,
        PayrollSetupCardComponent,
        PendingTasksCardComponent,
        TimeOffCardComponent,
        UserWorkloadCalendarComponent,
        LikedByDialogComponent,
        ShareCollectionDialogComponent,
        PasswordStrengthComponent,
        PricingTableComponent,
        HolidayRejectionDialogComponent,
    ],
    providers: [
        { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: false } },
        ThemeService,
        DatePipe
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class SharedModule { }
