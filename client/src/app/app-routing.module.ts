import { GroupComponent } from './dashboard/groups/group/group.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserProfileComponent } from './dashboard/user-profile/user-profile.component';
import { AdminComponent } from './dashboard/admin/admin.component';
import { GroupsComponent } from './dashboard/groups/groups.component';
import { NewWorkspacePage1Component } from './Authentication/new-workspace-page-1/new-workspace-page-1.component';
import { NewWorkspacePage2Component } from './Authentication/new-workspace-page-2/new-workspace-page-2.component';
import { SigninComponent } from './Authentication/signin/signin.component';
import { WelcomePageComponent } from './Authentication/welcome-page/welcome-page.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OverviewComponent } from './dashboard/overview/overview.component';
import { ProfileComponent } from './dashboard/user-profile/profile/profile.component';
import { SignupComponent } from './Authentication/signup/signup.component';

import { AuthGuard } from './shared/guards/auth.guard';
import { NotAuthGuard } from './shared/guards/not-auth.guard';
import { PageNotFoundComponent } from './common/components/page-not-found/page-not-found.component';
import { GroupActivityComponent } from './dashboard/groups/group/group-activity/group-activity.component';
import { GroupAdminComponent } from './dashboard/groups/group/group-admin/group-admin.component';
import { GroupMembersComponent } from './dashboard/groups/group/group-members/group-members.component';
import { GroupCalendarComponent } from './dashboard/groups/group/group-calendar/group-calendar.component';
import { GroupFilesComponent } from './dashboard/groups/group/group-files/group-files.component';
import { GroupPostComponent } from './dashboard/groups/group/group-post/group-post.component';
import { GroupTasksComponent } from './dashboard/groups/group/group-tasks/group-tasks.component';
import { AdminGeneralComponent } from './dashboard/admin/admin-general/admin-general.component';
import { AdminMembersComponent } from './dashboard/admin/admin-members/admin-members.component';
import { OverviewMyTasksComponent } from './dashboard/overview/overview-my-tasks/overview-my-tasks.component';
import {OverviewMyWorkplaceComponent} from "./dashboard/overview/overview-my-workplace/overview-my-workplace.component";
import { AdminBillingComponent } from './dashboard/admin/admin-billing/admin-billing.component';
import {DenyNavigationGuard} from "./shared/guards/deny-navigation.guard";
// import {ValidSubscriptionGuard} from "./shared/guards/valid-subscription.guard";
import { CloudsComponent } from './dashboard/user-profile/clouds/clouds.component';
import {ResetPwdComponent} from "./Authentication/reset-password/reset-password.component";
import {AllSearchResultsComponent} from "./dashboard/search/all-search-results/all-search-results.component";
import { CollaborativeDocGroupPostComponent } from './common/components/posts/collaborative-doc-group-post/collaborative-doc-group-post.component';


const appRoutes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'signup', component: SignupComponent, canActivate: [NotAuthGuard] },
  {
    path: 'signin', component: SigninComponent, canActivate: [NotAuthGuard]
  },
  { path: 'home', component: WelcomePageComponent, canActivate: [NotAuthGuard] },
  { path: 'create-new-Workspace-page2', component: NewWorkspacePage2Component, canActivate: [NotAuthGuard] },
  { path: 'create-new-Workspace-page1', component: NewWorkspacePage1Component, canActivate: [NotAuthGuard] },
  { path: 'resetPassword/:id', component: ResetPwdComponent, canActivate: [NotAuthGuard]},
  { path: 'dashboard/group/:id/document/:postId', component: CollaborativeDocGroupPostComponent, canActivate: [AuthGuard]},
  {
    path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard],
    children: [
      { path: 'all-search-results/:query', component: AllSearchResultsComponent},
      { path: 'overview', component: OverviewComponent},
      { path: 'overview/mytasks', component: OverviewMyTasksComponent},
      { path: 'overview/myworkplace', component: OverviewMyWorkplaceComponent},
      {
        path: 'groups', component: GroupsComponent, 
      },
      {
        path: 'group/:id', component: GroupComponent,

        children: [
          { path: 'activity', component: GroupActivityComponent },
          { path: 'files', component: GroupFilesComponent },
          { path: 'calendar', component: GroupCalendarComponent },
          { path: 'members', component: GroupMembersComponent },
          { path: 'admin', component: GroupAdminComponent },
          { path: 'post/:postId', component: GroupPostComponent },
          { path: 'tasks', component: GroupTasksComponent },
        ]
      },
      {
        path: 'admin', component: AdminComponent,
        children: [
          { path: 'general', component: AdminGeneralComponent },
          { path: 'members', component: AdminMembersComponent}
          // {
          //   path: 'billing',
          //   component: AdminBillingComponent,
          //   canDeactivate: [DenyNavigationGuard]
          // }
        ]
      },
      {
        path: 'profile/:userId', component: UserProfileComponent, 
        children: [{ path: 'profile', component: ProfileComponent },
        { path: 'clouds', component: CloudsComponent }]
      }
    ]
  },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({

  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
export const routingComponents = [UserProfileComponent, AdminComponent, GroupsComponent, NewWorkspacePage1Component,
  NewWorkspacePage2Component, SigninComponent, WelcomePageComponent, DashboardComponent, OverviewComponent,
  ProfileComponent, SignupComponent, PageNotFoundComponent, GroupActivityComponent, GroupAdminComponent, GroupFilesComponent,
  GroupCalendarComponent, GroupMembersComponent, AdminGeneralComponent, AdminMembersComponent, GroupPostComponent];
