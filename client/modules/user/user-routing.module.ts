import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { UserCloudsComponent } from './user-clouds/user-clouds.component';
import { UserWorkloadComponent } from './user-workload/user-workload.component';

const routes: Routes = [
  { path: 'profile', component: UserProfileComponent, runGuardsAndResolvers: `always` },
  { path: 'clouds', component: UserCloudsComponent, runGuardsAndResolvers: `always` },
  { path: 'workload', component: UserWorkloadComponent, runGuardsAndResolvers: `always` }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
