import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminGuard } from 'src/shared/guards/admin-guard/admin.guard';
import { DenyNavigationGuard } from 'src/shared/guards/deny-navigation-guard/deny-navigation.guard';

const routes: Routes = [
  {
    path: '', children: [
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
          },
        canActivateChild: [DenyNavigationGuard]
      },
      {
        path: 'myspace',
        loadChildren: () => import('modules/myspace/myspace.module')
          .then((module) => module.MyspaceModule),
          data: {
            preload: false
          },
        canActivateChild: [DenyNavigationGuard]
      },
      {
        path: 'user',
        loadChildren: () => import('modules/user/user.module')
          .then((module) => module.UserModule),
          data: {
            preload: false
          },
        canActivateChild: [DenyNavigationGuard]
      }
    ]
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
  providers: [AdminGuard, DenyNavigationGuard]
})
export class DashboardRoutingModule { }
