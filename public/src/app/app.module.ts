import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { WelcomePageComponent } from './Authentication/welcome-page/welcome-page.component';
import { SignupComponent } from './Authentication/signup/signup.component';
import { SigninComponent } from './Authentication/signin/signin.component';
import { NewWorkspacePage1Component } from './Authentication/new-workspace-page-1/new-workspace-page-1.component';
import { NewWorkspacePage2Component } from './Authentication/new-workspace-page-2/new-workspace-page-2.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OverviewComponent } from './dashboard/overview/overview.component';
import { AdminComponent } from './dashboard/admin/admin.component';
import { GroupsComponent } from './dashboard/groups/groups.component';
import { NavbarComponent } from './common/components/navbar/navbar.component';
import { AdminPageHeaderComponent } from './dashboard/admin/admin-page-header/admin-page-header.component';
import { GroupsPageHeaderComponent } from './dashboard/groups/groups-page-header/groups-page-header.component';
import { OverviewPageHeaderComponent } from './dashboard/overview/overview-page-header/overview-page-header.component';
import { UserProfileComponent } from './dashboard/user-profile/user-profile.component';
import { UserProfileHeaderComponent } from './dashboard/user-profile/user-profile-header/user-profile-header.component';
import { ProfileComponent } from './dashboard/user-profile/profile/profile.component';
import { ActivityComponent } from './dashboard/user-profile/activity/activity.component';
import { FilesComponent } from './dashboard/user-profile/files/files.component';
import { CalendarComponent } from './dashboard/user-profile/calendar/calendar.component';
import { AppRoutingModule } from './app-routing.module';
import { GroupComponent } from './dashboard/groups/group/group.component';
import { GroupHeaderComponent } from './dashboard/groups/group/group-header/group-header.component';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from './shared/services/auth.service';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';


@NgModule({
  declarations: [
    AppComponent,
    WelcomePageComponent,
    SignupComponent,
    SigninComponent,
    NewWorkspacePage1Component,
    NewWorkspacePage2Component,
    DashboardComponent,
    OverviewComponent,
    AdminComponent,
    GroupsComponent,
    NavbarComponent,
    AdminPageHeaderComponent,
    GroupsPageHeaderComponent,
    OverviewPageHeaderComponent,
    UserProfileComponent,
    UserProfileHeaderComponent,
    ProfileComponent,
    ActivityComponent,
    FilesComponent,
    CalendarComponent,
    GroupComponent,
    GroupHeaderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [AuthService, { provide: LocationStrategy, useClass: HashLocationStrategy }],
  bootstrap: [AppComponent]
})
export class AppModule { }
