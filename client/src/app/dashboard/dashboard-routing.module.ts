import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NavbarComponent } from '../common/navbar/navbar.component';
import { AdminGuard } from 'src/shared/guards/admin-guard/admin.guard';

const routes: Routes = [
  {
    path: '', component: NavbarComponent, children: [
      {
        path: 'admin',
        loadChildren: () => import('modules/admin/admin.module')
          .then((module) => module.AdminModule),
        canActivate: [AdminGuard],
        data: {
          preload: false
        }
      },
      {
        path: 'work',
        loadChildren: () => import('modules/work/work.module')
          .then((module) => module.WorkModule),
          data: {
            preload: false
          }
      },
      {
        path: 'myspace',
        loadChildren: () => import('modules/myspace/myspace.module')
          .then((module) => module.MyspaceModule),
          data: {
            preload: false
          }
      },
      {
        path: 'user',
        loadChildren: () => import('modules/user/user.module')
          .then((module) => module.UserModule),
          data: {
            preload: false
          }
      }
    ]
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
  providers: [AdminGuard]
})
export class DashboardRoutingModule { }
