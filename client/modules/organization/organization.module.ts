import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganizationRoutingModule } from './organization-routing.module';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/common/shared/shared.module';
import { OrganizationComponent } from './organization/organization.component';
import { PeopleDirectoryComponent } from './people-directory/people-directory.component';
import { PeopleDirectorySearchResultsComponent } from './people-directory-search-results/people-directory-search-results.component';
import { OrganizationChartComponent } from './organization-chart/organization-chart.component';


@NgModule({
  declarations: [
    OrganizationComponent,
    PeopleDirectoryComponent,
    PeopleDirectorySearchResultsComponent,
    OrganizationChartComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    OrganizationRoutingModule,
    SharedModule
  ],
  exports: [

  ]
})
export class OrganizationModule { }
