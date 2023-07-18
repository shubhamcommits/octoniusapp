import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NorthStarPageComponent } from './north-star-page/north-star-page.component';
import { DashboardPageComponent } from './dashboard-page/dashboard-page.component';
import { AdminGuard } from 'src/shared/guards/admin-guard/admin.guard';
import { OrganizationModuleAvailableGuard } from 'src/shared/guards/organization-module-available-guard/organization-module-available.guard';
import { LoungeModuleAvailableGuard } from 'src/shared/guards/lounge-module-available-guard/lounge-module-available.guard';

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
    },
    canActivate: [LoungeModuleAvailableGuard]
  },

  // Organization Module
  {
    path: 'organization',
    loadChildren: () => import('modules/organization/organization.module')
      .then((module) => module.OrganizationModule),
    data: {
      preload: false,
      state: 'organization'
    },
    canActivate: [OrganizationModuleAvailableGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [AdminGuard]
})
export class WorkRoutingModule { }
