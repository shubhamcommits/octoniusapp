import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkRoutingModule } from './work-routing.module';

import { PulseComponent } from './pulse/pulse.component'
import { SharedModule } from 'src/app/common/shared/shared.module';
import { NorthStarPageComponent } from './north-star-page/north-star-page.component';
import { DashboardPageComponent } from './dashboard-page/dashboard-page.component';
import { WorkStatisticsCardComponent } from './dashboard-page/work-statistics-card/work-statistics-card.component';
import { WorkloadCardComponent } from './dashboard-page/workload-card/workload-card.component';
import { VelocityCardComponent } from './dashboard-page/velocity-card/velocity-card.component';
import { PulseCardComponent } from './dashboard-page/pulse-card/pulse-card.component';
import { PeopleDirectoryCardComponent } from './dashboard-page/people-directory-card/people-directory-card.component';
import { OrganizationalStructureCardComponent } from './dashboard-page/organizational-structure-card/organizational-structure-card.component';
import { CompanyObjectivesCardComponent } from './dashboard-page/company-objectives-card/company-objectives-card.component';
import { EngagementCardComponent } from './dashboard-page/engagement-card/engagement-card.component';
import { GlobalPerformanceCardComponent } from './dashboard-page/global-performance-card/global-performance-card.component';
import { MatSelectModule } from '@angular/material';


@NgModule({
  declarations: [

    // Pulse Component
    PulseComponent,
    NorthStarPageComponent,
    DashboardPageComponent,
    WorkStatisticsCardComponent,
    WorkloadCardComponent,
    VelocityCardComponent,
    PulseCardComponent,
    PeopleDirectoryCardComponent,
    OrganizationalStructureCardComponent,
    CompanyObjectivesCardComponent,
    EngagementCardComponent,
    GlobalPerformanceCardComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    WorkRoutingModule,
    MatSelectModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class WorkModule { }
