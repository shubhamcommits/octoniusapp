import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminGuard } from 'src/shared/guards/admin-guard/admin.guard';
import { HRGuard } from 'src/shared/guards/hr-guard/hr.guard';
import { OrganizationChartComponent } from './organization-chart/organization-chart.component';
import { OrganizationComponent } from './organization/organization.component';
import { PeopleDirectoryComponent } from './people-directory/people-directory.component';

const routes: Routes = [
  {
    path: '', component: OrganizationComponent
  },
  {
    path: 'directory', component: PeopleDirectoryComponent
  },
  {
    path: 'chart', component: OrganizationChartComponent
  },
  {
    path: 'hive',
    loadChildren: () => import('./hr/organization-hr.module')
      .then((module) => module.OrganizationHRModule),
    canActivate: [HRGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizationRoutingModule { }
