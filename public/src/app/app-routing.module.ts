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


const appRoutes: Routes = [
  { path: '', component: WelcomePageComponent },
  { path: 'signup', component: SignupComponent },
  {
    path: 'signin', component: SigninComponent
  },
  { path: 'create-new-Workspace-page2', component: NewWorkspacePage2Component },
  { path: 'create-new-Workspace-page1', component: NewWorkspacePage1Component },
  {
    path: 'dashboard', component: DashboardComponent,
    children: [
      { path: 'overview', component: OverviewComponent },
      { path: 'groups', component: GroupsComponent },
      { path: 'admin', component: AdminComponent },
      {
        path: 'profile', component: UserProfileComponent,
        children: [{ path: 'profile', component: ProfileComponent }]
      },

      { path: 'group', component: GroupComponent }
    ]
  }
];

@NgModule({

  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
