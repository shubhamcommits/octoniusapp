/**
 * !===== COMPONENTS =====!
 */

import { AppComponent } from './app.component';

// ----- SEARCH BAR & NAVBAR COMPONENTS -----
import { NavbarComponent } from './common/components/navbar/navbar.component';

// ----- SEARCH BAR -----
import { AllSearchResultsComponent } from './dashboard/search/all-search-results/all-search-results.component';
import { ClickStopPropagationDirective } from './shared/directives/click-stop-propagation.directive';
import { ContentSearchResultComponent } from './common/components/search/content-search-result/content-search-result.component';
import { UserSearchResultComponent } from './common/components/search/user-search-result/user-search-result.component';
import { UserSearchResultMainComponent } from './common/components/search/user-search-result-main/user-search-result-main.component';
import { SearchBarComponent } from './common/components/navbar/search-bar/search-bar.component';

// ----- OVERVIEW COMPONENTS -----
import { OverviewPageHeaderComponent } from './dashboard/overview/overview-page-header/overview-page-header.component';
import { OverviewMyTasksComponent } from './dashboard/overview/overview-my-tasks/overview-my-tasks.component';
import { OverviewMyWorkplaceComponent } from './dashboard/overview/overview-my-workplace/overview-my-workplace.component';

// ----- GROUP COMPONENTS -----
import { GroupsPageHeaderComponent } from './dashboard/groups/groups-page-header/groups-page-header.component';
import { GroupHeaderComponent } from './dashboard/groups/group/group-header/group-header.component';
import { GroupComponent } from './dashboard/groups/group/group.component';
import { GroupPostComponent } from './dashboard/groups/group/group-post/group-post.component';
import { GroupTasksComponent } from './dashboard/groups/group/group-tasks/group-tasks.component';
import { GroupTasksNewComponent } from './dashboard/groups/group/group-tasks-new/group-tasks-new.component';
import { GroupActivityFiltersComponent } from './dashboard/groups/group/group-activity/group-activity-filters/group-activity-filters.component';
import { GroupActivityProgressComponent } from './dashboard/groups/group/group-activity/group-activity-progress/group-activity-progress.component';
import { GroupSmartAdminComponent } from './dashboard/groups/group/group-smart-admin/group-smart-admin.component';
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
import { AdminPageHeaderComponent } from './dashboard/admin/admin-page-header/admin-page-header.component';
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
 * !===== ANGULAR MODULES =====!
 */
import { AppRoutingModule, routingComponents } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule, CdkDragExit } from '@angular/cdk/drag-drop';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { ReactiveFormsModule, FormsModule, FormGroup } from '@angular/forms';
import 'core-js/es6/reflect';
import 'core-js/es7/reflect';
import 'zone.js/dist/zone';



/**
 * !===== SERVICES =====!
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
import { TokenInterceptorService } from './shared/services/token-interceptor.service';
import { UserService } from './shared/services/user.service';
import { WorkspaceService } from './shared/services/workspace.service';



/**
 * !===== GUARDS =====!
 */
import { AuthGuard } from './shared/guards/auth.guard';
import { DenyNavigationGuard } from "./shared/guards/deny-navigation.guard";
import { NotAuthGuard } from './shared/guards/not-auth.guard';
import { ValidSubscriptionGuard } from "./shared/guards/valid-subscription.guard";



/**
 * !===== PIPES =====!
 */
import { DatePipe } from '@angular/common';
import { InsertDecimalPointPipe } from "./shared/pipes/insert-decimal-point.pipe";
import { SafePipe } from './shared/pipes/safe.pipe';
import { LimitCharacterPipe } from './shared/pipes/limit-character.pipe';
import { TimeAgoPipe } from 'time-ago-pipe';



/**
 * !===== THIRD PARTY MODULES =====!
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
import { NgCircleProgressModule } from 'ng-circle-progress';
import { NgxSkillBarModule } from "ngx-skill-bar";
import { NgxUiLoaderModule, NgxUiLoaderConfig, SPINNER, POSITION, PB_DIRECTION } from 'ngx-ui-loader';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { QuillModule } from 'ngx-quill';
import { ScrollToModule } from 'ng2-scroll-to-el';
import { SnotifyModule, SnotifyService, ToastDefaults } from 'ng-snotify';


const ngxUiLoaderConfig: NgxUiLoaderConfig = {

  "bgsColor": "#005fd5",
  "bgsOpacity": 0.9,
  "bgsPosition": "center-center",
  "bgsSize": 100,
  "bgsType": "three-bounce",
  "blur": 15,
  "fgsColor": "#fff",
  "fgsPosition": "center-center",
  "fgsSize": 100,
  "fgsType": "three-strings",
  "gap": 24,
  "logoPosition": "center-center",
  "logoSize": 120,
  "overlayColor": "rgb(0, 95, 213, 1.0)",
  "pbColor": "#fff",
  "pbDirection": "ltr",
  "pbThickness": 5,
  "hasProgressBar": true,
  "text": "Bringing you up to date...",
  "textColor": "#FFFFFF",
  "textPosition": "center-center"
};

const ngCircle = {
  "radius": 50,
  "space": -10,
  "outerStrokeGradient": true,
  "outerStrokeWidth": 10,
  "outerStrokeColor": "#4882c2",
  "outerStrokeGradientStopColor": "#53a9ff",
  "innerStrokeColor": "#e7e8ea",
  "innerStrokeWidth": 10,
  "animateTitle": false,
  "responsive": true,
  "animationDuration": 500,
  "showBackground": false,
  "startFromZero": false
};

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    AdminPageHeaderComponent,
    GroupsPageHeaderComponent,
    OverviewPageHeaderComponent,
    UserProfileHeaderComponent,
    ActivityComponent,
    FilesComponent,
    CalendarComponent,
    GroupComponent,
    GroupHeaderComponent,
    routingComponents,
    SafePipe,
    TimeAgoPipe,
    GroupPostComponent,
    GroupTasksComponent,
    OverviewMyTasksComponent,
    OverviewMyWorkplaceComponent,
    AdminBillingComponent,
    InsertDecimalPointPipe,
    PostboxComponent,
    AssignUsersModalComponent,
    DatePickerComponent,
    TimePickerComponent,
    NormalGroupPostComponent,
    PostActionsComponent,
    CommentSectionComponent,
    PostCommentComponent,
    TaskGroupPostComponent,
    EventGroupPostComponent,
    CloudsComponent,
    ResetPwdComponent,
    LimitCharacterPipe,
    ClickStopPropagationDirective,
    UserSearchResultComponent,
    ContentSearchResultComponent,
    AllSearchResultsComponent,
    UserSearchResultMainComponent,
    SearchBarComponent,
    GroupActivityFiltersComponent,
    GroupActivityProgressComponent,
    CollaborativeDocGroupPostComponent,
    CollaborativeDocGroupNavbarComponent,
    CollabDocPostComponent,
    CollaborativeDocGroupCommentsComponent,
    CollaborativeDocGroupPostCommentComponent,
    GroupTasksNewComponent,
    PulseComponent,
    GroupSmartAdminComponent,
    DialogOverviewExampleDialog,
    DocumentFileComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularMultiSelectModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    QuillModule,
    SnotifyModule,
    MomentModule,
    InfiniteScrollModule,
    ClickOutsideModule,
    NgxSkillBarModule,
    ImageCropperModule,
    NgxUiLoaderModule.forRoot(ngxUiLoaderConfig),
    NgCircleProgressModule.forRoot(ngCircle),
    FontAwesomeModule,
    BrowserAnimationsModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    OverlayModule,
    DragDropModule,
    PdfViewerModule,
    NgbModule.forRoot(),
    ScrollToModule.forRoot(),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    })
  ],

  providers: [
    // SERVICES
    AuthService, UserService, 
    PostService, GroupService,
    GroupDataService, WorkspaceService, 
    ProfileDataService, GroupsService, 
    AdminService, GoogleCloudService,
    DocumentService, ColumnService, 
    DocumentFileService, QuillAutoLinkService,
    SnotifyService, SearchService,
    // GUARDS
    DenyNavigationGuard, AuthGuard, 
    NotAuthGuard, ValidSubscriptionGuard,
    // PROVIDERS
    { provide: 'SnotifyToastConfig', useValue: ToastDefaults },
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptorService, multi: true },
    { provide: LocationStrategy, useClass: HashLocationStrategy }],
  bootstrap: [AppComponent],
  entryComponents: [DialogOverviewExampleDialog],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule { }
