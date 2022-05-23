import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganizationRoutingModule } from './organization-routing.module';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/common/shared/shared.module';
import { OrganizationComponent } from './organization/organization.component';
import { PeopleDirectoryComponent } from './people-directory/people-directory.component';
import { PeopleDirectorySearchResultsComponent } from './people-directory-search-results/people-directory-search-results.component';
import { OrganizationChartComponent } from './organization-chart/organization-chart.component';
import { ChartPersonComponent } from './organization-chart/chart-person/chart-person.component';
import { AddMemberToLevelComponent } from './organization-chart/add-member-to-level/add-member-to-level.component';


@NgModule({
  declarations: [
    OrganizationComponent,
    PeopleDirectoryComponent,
    PeopleDirectorySearchResultsComponent,
    OrganizationChartComponent,
    ChartPersonComponent,
    AddMemberToLevelComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    OrganizationRoutingModule,
    SharedModule
  ],
  exports: [
    AddMemberToLevelComponent
  ]
})
export class OrganizationModule { }
