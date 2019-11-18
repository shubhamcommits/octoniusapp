import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NavbarComponent } from '../common/navbar/navbar.component';
import { AdminGuard } from 'src/shared/guards/admin-guard/admin.guard';

const routes: Routes = [
  { path: '', component: NavbarComponent, children:[
    { path: 'myspace', loadChildren: './myspace/myspace.module#MyspaceModule' },
    { path: 'groups', loadChildren: './groups/groups.module#GroupsModule' },
    { path: 'admin', loadChildren: './admin/admin.module#AdminModule', canActivate:[AdminGuard] },
    { path: 'user', loadChildren: './user/user.module#UserModule' }
  ] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [AdminGuard]
})
export class DashboardRoutingModule { }
