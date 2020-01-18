import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NavbarComponent } from '../common/navbar/navbar.component';
import { AdminGuard } from 'src/shared/guards/admin-guard/admin.guard';


import { AdminSharedModule } from 'projects/admin/src/app/app.module';
import { MySpaceSharedModule } from 'projects/myspace/src/app/app.module';
import { GroupsSharedModule } from 'projects/groups/src/app/app.module';

const routes: Routes = [
  {
    path: '', component: NavbarComponent, children: [
      {
        path: 'myspace',
        loadChildren: () => import('projects/myspace/src/app/app.module')
          .then((module) => module.MySpaceSharedModule)
      },
      {
        path: 'groups',
        loadChildren: () => import('projects/groups/src/app/app.module')
          .then((module) => module.GroupsSharedModule)
      },
      {
        path: 'admin',
        loadChildren: () => import('projects/admin/src/app/app.module')
          .then((module) => module.AdminSharedModule),
        canActivate: [AdminGuard]
      },
      // { path: 'user', loadChildren: './user/user.module#UserModule' }
    ]
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    AdminSharedModule.forRoot(),
    GroupsSharedModule.forRoot(),
    MySpaceSharedModule.forRoot()
  ],
  exports: [RouterModule],
  providers: [AdminGuard]
})
export class DashboardRoutingModule { }
