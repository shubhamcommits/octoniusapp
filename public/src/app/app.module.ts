import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppRoutingModule, routingComponents } from './app-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


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
    routingComponents
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule.forRoot()
  ],
  providers: [AuthService, UserService, WorkspaceService, AdminService, AuthGuard, NotAuthGuard,
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptorService, multi: true },
    { provide: LocationStrategy, useClass: HashLocationStrategy }],
  bootstrap: [AppComponent]
})
export class AppModule { }
