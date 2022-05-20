import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
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
  /*
  {
    path: 'chart', component: OrganizationChartComponent
  }
  */
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizationRoutingModule { }
