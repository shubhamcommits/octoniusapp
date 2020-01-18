/**
 * !===== APP MODULE OF OCTONIUS CLIENT =====!
 *
 * Please read the points below, before importing and injecting any dependencies:-
 * 1. Make sure that you document your import and if it's a part of exisiting module then import that under that
 * particular section, otherwise make a new suitable one.
 * 2. Insert the entries under the section in lexographical order.
 */

/**
 * !===== INDEX =====!
 *
 * 1. COMPONENTS
 * 2. ANGULAR MODULES
 * 3. SERVICES
 * 4. GUARDS
 * 5. PIPES
 * 6. THIRD PARTY MODULES
 * 7. CONFIG VARIABLES
 * 7. DIRECTIVES
 * 9. IMPORTS & DECLARATIONS
 */

/**
 * 1. !===== COMPONENTS =====!
 */

import { AppComponent } from './app.component';

// ----- AUTHENTICATION COMPONENTS -----
import { AuthSignInComponent } from './Authentication/auth-sign-in/auth-sign-in.component';
import { ForgotPasswordComponent } from './Authentication/forgot-password/forgot-password.component';

// ----- SEARCH BAR & NAVBAR COMPONENTS -----
import { NavbarComponent } from './common/components/navbar/navbar.component';

// ----- SEARCH BAR -----
import { AllSearchResultsComponent } from './dashboard/search/all-search-results/all-search-results.component';
import { ContentSearchResultComponent } from './common/components/search/content-search-result/content-search-result.component';
import { SearchBarComponent } from './common/components/navbar/search-bar/search-bar.component';
import { UserSearchResultComponent } from './common/components/search/user-search-result/user-search-result.component';
import { UserSearchResultMainComponent } from './common/components/search/user-search-result-main/user-search-result-main.component';

// ----- OVERVIEW COMPONENTS -----
import { OverviewMyAgendaComponent } from './dashboard/overview/overview-my-agenda/overview-my-agenda.component';
import { OverviewMyTasksComponent } from './dashboard/overview/overview-my-tasks/overview-my-tasks.component';
import { OverviewMyWorkplaceComponent } from './dashboard/overview/overview-my-workplace/overview-my-workplace.component';

// ----- GROUP COMPONENTS -----
import { GroupActivityFiltersComponent } from './dashboard/groups/group/group-activity/group-activity-filters/group-activity-filters.component';
import { GroupActivityProgressComponent } from './dashboard/groups/group/group-activity/group-activity-progress/group-activity-progress.component';
import { GroupComponent } from './dashboard/groups/group/group.component';
import { GroupPostComponent } from './dashboard/groups/group/group-post/group-post.component';
import { GroupSmartAdminComponent } from './dashboard/groups/group/group-smart-admin/group-smart-admin.component';
import { GroupTasksComponent } from './dashboard/groups/group/group-tasks/group-tasks.component';
import { GroupTasksNewComponent } from './dashboard/groups/group/group-tasks-new/group-tasks-new.component';
import { PulseComponent } from './dashboard/groups/pulse/pulse.component';

// ----- POST VIEW COMPONENTS -----
import { NormalGroupPostComponent } from './common/components/posts/normal-group-post/normal-group-post.component';
import { EventGroupPostComponent } from './common/components/posts/event-group-post/event-group-post.component';
import { TaskGroupPostComponent } from './common/components/posts/task-group-post/task-group-post.component';

// ----- POST COMPONENTS -----
import { AssignUsersModalComponent } from './common/components/modals/assign-users-modal/assign-users-modal.component';
import { CommentSectionComponent } from './common/components/comments/comment-section/comment-section.component';
import { DatePickerComponent } from './common/components/modals/date-picker/date-picker.component';
import { PostActionsComponent } from './common/components/posts/post-actions/post-actions.component';
import { PostboxComponent } from './common/components/posts/postbox/postbox.component';
import { PostCommentComponent } from './common/components/comments/post-comment/post-comment.component';
import { TimePickerComponent } from './common/components/modals/time-picker/time-picker.component';

// ----- OCTO-DOC COMPONENTS -----
import { CollaborativeDocGroupPostComponent, DialogOverviewExampleDialog } from './common/components/posts/collaborative-doc-group-post/collaborative-doc-group-post.component';
import { CollaborativeDocGroupNavbarComponent } from './common/components/posts/collaborative-doc-group-post/collaborative-doc-group-navbar/collaborative-doc-group-navbar.component';
import { CollabDocPostComponent } from './common/components/posts/collab-doc-post/collab-doc-post.component';
import { CollaborativeDocGroupCommentsComponent } from './common/components/posts/collaborative-doc-group-post/collaborative-doc-group-comments/collaborative-doc-group-comments.component';
import { CollaborativeDocGroupPostCommentComponent } from './common/components/posts/collaborative-doc-group-post/collaborative-doc-group-post-comment/collaborative-doc-group-post-comment.component';
import { DocumentFileComponent } from './shared/utils/document-file/document-file.component';

// ----- ADMIN COMPONENTS -----
import { ResetPwdComponent } from "./Authentication/reset-password/reset-password.component";

// ----- USER PROFILE COMPONENTS -----
import { UserProfileHeaderComponent } from './dashboard/user-profile/user-profile-header/user-profile-header.component';
import { CloudsComponent } from './dashboard/user-profile/clouds/clouds.component';
import { ActivityComponent } from './dashboard/user-profile/activity/activity.component';
import { FilesComponent } from './dashboard/user-profile/files/files.component';
import { CalendarComponent } from './dashboard/user-profile/calendar/calendar.component';

// ----- ADMIN BILLING COMPONENTS(THIS SECTION HAS BEEN DISABLED) -----
import { AdminBillingComponent } from './dashboard/admin/admin-billing/admin-billing.component';


/**
 * 2. !===== ANGULAR MODULES =====!
 */
import { AppRoutingModule, routingComponents } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule, CdkDragExit } from '@angular/cdk/drag-drop';
import { HashLocationStrategy, LocationStrategy, CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { ReactiveFormsModule, FormsModule, FormGroup } from '@angular/forms';
import 'core-js/es6/reflect';
import 'core-js/es7/reflect';
import 'zone.js/dist/zone';


/**
 * 3. !===== SERVICES =====!
 */
import { AdminService } from './shared/services/admin.service';
import { AuthService } from './shared/services/auth.service';
import { ColumnService } from './shared/services/column.service';
import { DocumentService } from './shared/services/document.service';
import { DocumentFileService } from './shared/services/document-file.service';
import { GoogleCloudService } from './shared/services/google-cloud.service';
import { GroupService } from './shared/services/group.service';
import { GroupDataService } from './shared/services/group-data.service';
import { GroupsService } from './shared/services/groups.service';
import { PostService } from './shared/services/post.service';
import { ProfileDataService } from "./shared/services/profile-data.service";
import { QuillAutoLinkService } from './shared/services/quill-auto-link.service';
import { SearchService } from "./shared/services/search.service";
import { StorageService } from './shared/services/storage-service/storage.service';
import { TokenInterceptorService } from './shared/services/token-interceptor.service';
import { UserService } from './shared/services/user.service';
import { UtilityService } from './shared/services/utility-service/utility.service';
import { WorkspaceService } from './shared/services/workspace.service';


/**
 * 4. !===== GUARDS =====!
 */
import { AuthGuard } from './shared/guards/auth.guard';
import { DenyNavigationGuard } from "./shared/guards/deny-navigation.guard";
import { NotAuthGuard } from './shared/guards/not-auth.guard';
import { ValidSubscriptionGuard } from "./shared/guards/valid-subscription.guard";


/**
 * 5. !===== PIPES =====!
 */
import { DatePipe } from '@angular/common';
import { InsertDecimalPointPipe } from "./shared/pipes/insert-decimal-point.pipe";
import { SafePipe } from './shared/pipes/safe.pipe';
import { LimitCharacterPipe } from './shared/pipes/limit-character.pipe';
import { TimeAgoPipe } from 'time-ago-pipe';


/**
 * 6. !===== THIRD PARTY MODULES =====!
 */
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { ClickOutsideModule } from 'ng-click-outside';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ImageCropperModule } from 'ngx-image-cropper';
import { MomentModule } from "ngx-moment";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
// import { NgCircleProgressModule } from 'ng-circle-progress';
import { NgxSkillBarModule } from "ngx-skill-bar";
import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { QuillModule } from 'ngx-quill';
import { ScrollToModule } from 'ng2-scroll-to-el';
import { SnotifyModule, SnotifyService, ToastDefaults } from 'ng-snotify';


/**
 * 7. !===== CONFIG VARIABLES =====!
 */
import { ngxUiLoaderConfig, ngCircle } from './shared/config/config';


/**
 * 8. !===== DIRECTIVES =====!
 */
import { ClickStopPropagationDirective } from './shared/directives/click-stop-propagation.directive';
import { GroupKanbanBoardsComponent } from './dashboard/groups/group/group-kanban-boards/group-kanban-boards.component';
import { GroupKanbanTaskViewComponent } from './dashboard/groups/group/group-kanban-boards/group-kanban-task-view/group-kanban-task-view.component';
import { GroupKanbanTaskAssignmentComponent } from './dashboard/groups/group/group-kanban-boards/group-kanban-task-assignment/group-kanban-task-assignment.component';
import { CollaborativeDocModalTemplatesComponent } from './common/components/posts/collaborative-doc-modal-templates/collaborative-doc-modal-templates.component';
import { SearchUsersComponent } from './common/components/search-users/search-users.component';
import { NotificationsBarComponent } from './common/components/navbar/notifications-bar/notifications-bar.component';
import { MainNavbarComponent } from './common/components/navbar/main-navbar/main-navbar.component';
import { SecondLevelNavbarComponent } from './common/components/navbar/second-level-navbar/second-level-navbar.component';
import { ThirdLevelNavbarComponent } from './common/components/navbar/third-level-navbar/third-level-navbar.component';
import { GroupEditComponent } from './dashboard/groups/group/group-edit/group-edit.component';
import { EditWorkplaceComponent } from './dashboard/admin/admin-general/edit-workplace/edit-workplace.component';

/**
 * 9. !===== IMPORTS & DECLARATIONS =====!
 */
@NgModule({
  declarations: [

    // COMPONENTS
    ActivityComponent, AdminBillingComponent,
    AllSearchResultsComponent, AppComponent, AssignUsersModalComponent,
    AuthSignInComponent, CalendarComponent, CloudsComponent, CollabDocPostComponent,
    CollaborativeDocGroupCommentsComponent, CollaborativeDocGroupNavbarComponent,
    CollaborativeDocGroupPostCommentComponent, CollaborativeDocGroupPostComponent,
    CommentSectionComponent, ContentSearchResultComponent, DatePickerComponent,
    DialogOverviewExampleDialog, DocumentFileComponent, EventGroupPostComponent,
    FilesComponent, GroupActivityFiltersComponent, GroupActivityProgressComponent,
    GroupComponent, GroupPostComponent, GroupSmartAdminComponent,
    GroupTasksComponent, GroupTasksNewComponent,
    NavbarComponent, NormalGroupPostComponent, OverviewMyAgendaComponent, OverviewMyTasksComponent,
    OverviewMyWorkplaceComponent, PostActionsComponent,
    PostboxComponent, PostCommentComponent, PulseComponent, ResetPwdComponent, SearchBarComponent,
    TaskGroupPostComponent, TimePickerComponent, UserProfileHeaderComponent,
    UserSearchResultComponent, UserSearchResultMainComponent,

    // ROUTING COMPONENTS
    routingComponents,

    // PIPES
    SafePipe,
    TimeAgoPipe,
    InsertDecimalPointPipe,
    LimitCharacterPipe,

    // DIRECTIVES
    ClickStopPropagationDirective,

    GroupKanbanBoardsComponent,

    GroupKanbanTaskViewComponent,

    GroupKanbanTaskAssignmentComponent,

    CollaborativeDocModalTemplatesComponent,

    SearchUsersComponent,

    NotificationsBarComponent,

    MainNavbarComponent,

    SecondLevelNavbarComponent,

    ThirdLevelNavbarComponent,

    GroupEditComponent,

    EditWorkplaceComponent
  ],
  imports: [

    // THIRD PARTY MODULES
    AngularMultiSelectModule, AppRoutingModule, BrowserAnimationsModule, BrowserModule,
    CommonModule, ClickOutsideModule, CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }), DragDropModule, FontAwesomeModule, FormsModule, HttpClientModule, ImageCropperModule,
    InfiniteScrollModule, MomentModule, NgbModule, 
    // NgCircleProgressModule.forRoot(ngCircle),
    NgxSkillBarModule, NgxUiLoaderModule.forRoot(ngxUiLoaderConfig), OverlayModule, OwlDateTimeModule,
    OwlNativeDateTimeModule, PdfViewerModule, QuillModule, ReactiveFormsModule, ScrollToModule.forRoot(), SnotifyModule
  ],

  providers: [
    // SERVICES
    AdminService, AuthService, ColumnService, DocumentFileService,
    DocumentService, GoogleCloudService, GroupDataService, GroupService,
    GroupsService, PostService, ProfileDataService, QuillAutoLinkService,
    SearchService, SnotifyService, StorageService, UserService, UtilityService, WorkspaceService,
    // GUARDS
    DenyNavigationGuard, AuthGuard,
    NotAuthGuard, ValidSubscriptionGuard,
    // PROVIDERS
    { provide: 'SnotifyToastConfig', useValue: ToastDefaults },
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptorService, multi: true },
    { provide: LocationStrategy, useClass: HashLocationStrategy }],
  bootstrap: [AppComponent],
  entryComponents: [DialogOverviewExampleDialog, CollaborativeDocModalTemplatesComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule { }
