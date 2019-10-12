/**
 * !===== APP ROUTING MODULE OF OCTONIUS CLIENT =====!
 * 
 * Please read the points below, before importing and injecting any dependencies:-
 * 1. Make sure that you document your import and if it's a part of exisiting module then import that under that 
 * particular section, otherwise make a new suitable one.
 * 2. Insert the entries under the section in lexographical order.
 */

/**
 * !===== INDEX =====!
 * 
 * 1. ANGULAR MODULES
 * 2. GUARDS
 * 3. CUSTOM COMPONENTS
 * 4. DEFINING & EXPORTING APP-ROUTES
 */

/**
 * 1. !===== ANGULAR MODULES =====!
 */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


/**
 * 2. !===== GUARDS =====!
 */
import { AuthGuard } from './shared/guards/auth.guard';
import { NotAuthGuard } from './shared/guards/not-auth.guard';
// DISBALED
import { DenyNavigationGuard } from "./shared/guards/deny-navigation.guard";
import { ValidSubscriptionGuard } from "./shared/guards/valid-subscription.guard";


/**
 * 3. !===== CUSTOM COMPONENTS =====!
 */

// ----- AUTHENTICATION -----
import { NewWorkspacePage1Component } from './Authentication/new-workspace-page-1/new-workspace-page-1.component';
import { NewWorkspacePage2Component } from './Authentication/new-workspace-page-2/new-workspace-page-2.component';
import { SigninComponent } from './Authentication/signin/signin.component';
import { SignupComponent } from './Authentication/signup/signup.component';
import { WelcomePageComponent } from './Authentication/welcome-page/welcome-page.component';

// ----- ADMIN SECTION -----
import { AdminComponent } from './dashboard/admin/admin.component';
import { AdminGeneralComponent } from './dashboard/admin/admin-general/admin-general.component';
import { AdminMembersComponent } from './dashboard/admin/admin-members/admin-members.component';
import { AdminBillingComponent } from './dashboard/admin/admin-billing/admin-billing.component';

// ----- USER PROFILE -----
import { CloudsComponent } from './dashboard/user-profile/clouds/clouds.component';
import { ProfileComponent } from './dashboard/user-profile/profile/profile.component';
import { UserProfileComponent } from './dashboard/user-profile/user-profile.component';

// ----- GROUPS -----
import { DashboardComponent } from './dashboard/dashboard.component';
import { GroupActivityComponent } from './dashboard/groups/group/group-activity/group-activity.component';
import { GroupAdminComponent } from './dashboard/groups/group/group-admin/group-admin.component';
import { GroupCalendarComponent } from './dashboard/groups/group/group-calendar/group-calendar.component';
import { GroupComponent } from './dashboard/groups/group/group.component';
import { GroupsComponent } from './dashboard/groups/groups.component';
import { GroupFilesComponent } from './dashboard/groups/group/group-files/group-files.component';
import { GroupMembersComponent } from './dashboard/groups/group/group-members/group-members.component';
import { GroupPostComponent } from './dashboard/groups/group/group-post/group-post.component';
import { GroupTasksComponent } from './dashboard/groups/group/group-tasks/group-tasks.component';
import { GroupTasksNewComponent } from './dashboard/groups/group/group-tasks-new/group-tasks-new.component';
import { PulseComponent } from './dashboard/groups/pulse/pulse.component';

// ----- OVERVIEW -----
import { OverviewComponent } from './dashboard/overview/overview.component';
import { OverviewMyTasksComponent } from './dashboard/overview/overview-my-tasks/overview-my-tasks.component';
import { OverviewMyWorkplaceComponent } from "./dashboard/overview/overview-my-workplace/overview-my-workplace.component";

// ----- UTILITIES -----
import { AllSearchResultsComponent } from "./dashboard/search/all-search-results/all-search-results.component";
import { CollaborativeDocGroupPostComponent } from './common/components/posts/collaborative-doc-group-post/collaborative-doc-group-post.component';
import { DocumentFileComponent } from './shared/utils/document-file/document-file.component';
import { PageNotFoundComponent } from './common/components/page-not-found/page-not-found.component';
import { ResetPwdComponent } from "./Authentication/reset-password/reset-password.component";


/**
 * 4. !===== DEFINING & EXPORTING APP-ROUTES =====!
 */

const appRoutes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  // ----- AUTHENTICATION -----
  { path: 'signup', component: SignupComponent, canActivate: [NotAuthGuard] },
  { path: 'signin', component: SigninComponent, canActivate: [NotAuthGuard] },
  { path: 'home', component: WelcomePageComponent, canActivate: [NotAuthGuard] },
  { path: 'create-new-Workspace-page2', component: NewWorkspacePage2Component, canActivate: [NotAuthGuard] },
  { path: 'create-new-Workspace-page1', component: NewWorkspacePage1Component, canActivate: [NotAuthGuard] },

  // ----- UTILITY -----
  { path: 'resetPassword/:id', component: ResetPwdComponent, canActivate: [NotAuthGuard] },

  // ----- DASHBOARD -----
  { path: 'dashboard/group/:id/document/:postId', component: CollaborativeDocGroupPostComponent, canActivate: [AuthGuard] },
  { path: 'dashboard/group/:id/files/:postId', component: DocumentFileComponent },
  {
    path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard],
    children: [
      { path: 'all-search-results/:query', component: AllSearchResultsComponent },
      { path: 'overview', component: OverviewComponent, canActivate: [ValidSubscriptionGuard] },
      { path: 'overview/mytasks', component: OverviewMyTasksComponent, canActivate: [ValidSubscriptionGuard] },
      { path: 'overview/myworkplace', component: OverviewMyWorkplaceComponent, canActivate: [ValidSubscriptionGuard] },
      {
        path: 'groups', component: GroupsComponent, canActivate: [ValidSubscriptionGuard]
      },
      { path: 'pulse', component: PulseComponent, canActivate: [ValidSubscriptionGuard] },
      {
        path: 'group/:id', component: GroupComponent, canActivate: [ValidSubscriptionGuard],

        children: [
          { path: 'activity', component: GroupActivityComponent },
          { path: 'files', component: GroupFilesComponent },
          { path: 'calendar', component: GroupCalendarComponent },
          { path: 'members', component: GroupMembersComponent },
          { path: 'admin', component: GroupAdminComponent },
          { path: 'post/:postId', component: GroupPostComponent },
          { path: 'tasks', component: GroupTasksComponent },
          { path: 'tasks-new', component: GroupTasksNewComponent },
        ]
      },

      // ----- ADMIN -----
      {
        path: 'admin', component: AdminComponent,
        children: [
          { path: 'general', component: AdminGeneralComponent, canActivate: [ValidSubscriptionGuard] },
          { path: 'members', component: AdminMembersComponent, canActivate: [ValidSubscriptionGuard] },
          {
            path: 'billing',
            component: AdminBillingComponent,
            canDeactivate: [DenyNavigationGuard]
          }
        ]
      },

      // ----- USER PROFILE -----
      {
        path: 'profile/:userId', component: UserProfileComponent, canActivate: [ValidSubscriptionGuard],
        children: [{ path: 'profile', component: ProfileComponent },
        { path: 'clouds', component: CloudsComponent }]
      }
    ]
  },

  // ----- UTILITY -----
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({

  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }

// !----- EXPORTING ROUTES -----!
export const routingComponents = [
  AdminComponent, AdminGeneralComponent, AdminMembersComponent,
  DashboardComponent, GroupActivityComponent, GroupAdminComponent,
  GroupCalendarComponent, GroupFilesComponent, GroupMembersComponent,
  GroupPostComponent, GroupsComponent, NewWorkspacePage1Component,
  NewWorkspacePage2Component, OverviewComponent, PageNotFoundComponent,
  ProfileComponent, PulseComponent, SigninComponent,
  SignupComponent, UserProfileComponent, WelcomePageComponent
];
