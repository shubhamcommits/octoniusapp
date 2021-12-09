import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NorthStarPageComponent } from './north-star-page/north-star-page.component';
import { DashboardPageComponent } from './dashboard-page/dashboard-page.component';
import { AdminGuard } from 'src/shared/guards/admin-guard/admin.guard';

const routes: Routes = [

  // Groups List
  {
    path: 'groups',
    loadChildren: () => import('modules/groups/groups.module')
      .then((module) => module.GroupsModule),
    data: {
      preload: false,
      state: 'group'
    }
  },

  // North Star
  { path: 'northstar', component: NorthStarPageComponent },

  // Dashboard Page
  { path: 'dashboard', component: DashboardPageComponent, canActivate: [AdminGuard] },

  // Lounge Module
  {
    path: 'lounge',
    loadChildren: () => import('modules/lounge/lounge.module')
      .then((module) => module.LoungeModule),
    data: {
      preload: false,
      state: 'lounge'
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [AdminGuard]
})
export class WorkRoutingModule { }
