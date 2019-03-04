import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup } from '@angular/forms';
import { AppRoutingModule, routingComponents } from './app-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown/angular2-multiselect-dropdown';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { QuillModule } from 'ngx-quill';
import { LoadingModule, ANIMATION_TYPES } from 'ngx-loading';
import { NgxUiLoaderModule, NgxUiLoaderConfig, SPINNER, POSITION, PB_DIRECTION } from  'ngx-ui-loader';
import { SnotifyModule, SnotifyService, ToastDefaults } from 'ng-snotify';
import { DatePipe } from '@angular/common';
import { ScrollToModule } from 'ng2-scroll-to-el';
import { CalendarModule } from 'angular-calendar';
import 'core-js/es6/reflect';
import 'core-js/es7/reflect';
import 'zone.js/dist/zone';
import { MentionModule } from 'angular-mentions/mention';
import { DragAndDropModule } from 'angular-draggable-droppable';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { EmojiModule } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { ClickOutsideModule } from 'ng-click-outside';

import { AppComponent } from './app.component';
import { NavbarComponent } from './common/components/navbar/navbar.component';
import { AdminPageHeaderComponent } from './dashboard/admin/admin-page-header/admin-page-header.component';
import { GroupsPageHeaderComponent } from './dashboard/groups/groups-page-header/groups-page-header.component';
import { OverviewPageHeaderComponent } from './dashboard/overview/overview-page-header/overview-page-header.component';
import { UserProfileHeaderComponent } from './dashboard/user-profile/user-profile-header/user-profile-header.component';
import { ActivityComponent } from './dashboard/user-profile/activity/activity.component';
import { FilesComponent } from './dashboard/user-profile/files/files.component';
import { CalendarComponent } from './dashboard/user-profile/calendar/calendar.component';
import { GroupComponent } from './dashboard/groups/group/group.component';
import { GroupHeaderComponent } from './dashboard/groups/group/group-header/group-header.component';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthService } from './shared/services/auth.service';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { AuthGuard } from './shared/guards/auth.guard';
import { NotAuthGuard } from './shared/guards/not-auth.guard';
import { TokenInterceptorService } from './shared/services/token-interceptor.service';
import { UserService } from './shared/services/user.service';
import { AdminService } from './shared/services/admin.service';
import { WorkspaceService } from './shared/services/workspace.service';
import { GroupsService } from './shared/services/groups.service';
import { PostService } from './shared/services/post.service';
import { GroupService } from './shared/services/group.service';
import { GroupDataService } from './shared/services/group-data.service';
import { SafePipe } from './safe.pipe';
import { NiceDateFormatPipePipe } from './nice-date-format-pipe.pipe';
import { OrderByPipePipe  } from './order-by-pipe.pipe';
import { GroupPostComponent } from './dashboard/groups/group/group-post/group-post.component';
import { GroupTasksComponent } from './dashboard/groups/group/group-tasks/group-tasks.component';
import { OverviewMyTasksComponent } from './dashboard/overview/overview-my-tasks/overview-my-tasks.component';
import { OverviewMyWorkplaceComponent } from './dashboard/overview/overview-my-workplace/overview-my-workplace.component';
import { QuillAutoLinkService } from './shared/services/quill-auto-link.service';
import { AdminBillingComponent } from './dashboard/admin/admin-billing/admin-billing.component';
import {DenyNavigationGuard} from "./shared/guards/deny-navigation.guard";
import {MomentModule} from "ngx-moment";
import {InsertDecimalPointPipe} from "./shared/pipes/insert-decimal-point.pipe";
import {ValidSubscriptionGuard} from "./shared/guards/valid-subscription.guard";
import { PostboxComponent } from './common/components/posts/postbox/postbox.component';
import { AssignUsersModalComponent } from './common/components/modals/assign-users-modal/assign-users-modal.component';
import { DatePickerComponent } from './common/components/modals/date-picker/date-picker.component';
import { TimePickerComponent } from './common/components/modals/time-picker/time-picker.component';
import { NormalGroupPostComponent } from './common/components/posts/normal-group-post/normal-group-post.component';
import { PostActionsComponent } from './common/components/posts/post-actions/post-actions.component';
import { CommentSectionComponent } from './common/components/comments/comment-section/comment-section.component';
import { PostCommentComponent } from './common/components/comments/post-comment/post-comment.component';

import { ImageCropperModule } from 'ngx-image-cropper';

import { TaskGroupPostComponent } from './common/components/posts/task-group-post/task-group-post.component';
import { EventGroupPostComponent } from './common/components/posts/event-group-post/event-group-post.component';
import { NgxSkillBarModule } from "ngx-skill-bar";

import {TimeAgoPipe} from 'time-ago-pipe';
import { CloudsComponent } from './dashboard/user-profile/clouds/clouds.component';

import { GoogleCloudService } from './shared/services/google-cloud.service';

import {ResetPwdComponent} from "./Authentication/reset-password/reset-password.component";

import { NgCircleProgressModule } from 'ng-circle-progress';


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
  "textPosition": "center-center",
  "threshold": 500 // progress bar thickness
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
    NiceDateFormatPipePipe,
    OrderByPipePipe,
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
    ResetPwdComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AngularMultiSelectModule,
    QuillModule,
    SnotifyModule,
    MentionModule,
    MomentModule,
    InfiniteScrollModule,
    PickerModule,
    ClickOutsideModule,
    EmojiModule,
    NgxSkillBarModule,
    ImageCropperModule,
    DragAndDropModule.forRoot(),
    NgxUiLoaderModule.forRoot(ngxUiLoaderConfig),
    NgCircleProgressModule.forRoot(ngCircle),
    LoadingModule.forRoot({
      animationType: ANIMATION_TYPES.wanderingCubes,
      backdropBackgroundColour: 'rgba(0,0,0,0.1)',
      backdropBorderRadius: '4px',
      primaryColour: '#ffffff',
      secondaryColour: '#ffffff',
      tertiaryColour: '#ffffff'
  }),
    FontAwesomeModule,
    BrowserAnimationsModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    NgbModule.forRoot(),
    ScrollToModule.forRoot(),
    CalendarModule.forRoot()
  ],

  providers: [AuthService, UserService, DenyNavigationGuard, PostService, GroupService,
    GroupDataService, WorkspaceService, GroupsService, AdminService, GoogleCloudService,
    AuthGuard, NotAuthGuard, QuillAutoLinkService, ValidSubscriptionGuard,
    { provide: 'SnotifyToastConfig', useValue: ToastDefaults},
    SnotifyService,
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptorService, multi: true },
    { provide: LocationStrategy, useClass: HashLocationStrategy }],
  bootstrap: [AppComponent]
})
export class AppModule { }
