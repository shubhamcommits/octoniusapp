import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserHeaderComponent } from './user-header/user-header.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserCloudsComponent } from './user-clouds/user-clouds.component';

const routes: Routes = [
  {
    path: '', component: UserHeaderComponent, children: [
      { path: 'profile', component: UserProfileComponent },
      { path: 'clouds', component: UserCloudsComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
