import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkRoutingModule } from './work-routing.module';

import { PulseComponent } from './pulse/pulse.component'
import { SharedModule } from 'src/app/common/shared/shared.module';
import { NorthStarPageComponent } from './north-star-page/north-star-page.component';
import { DashboardPageComponent } from './dashboard-page/dashboard-page.component';

import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NewNorthStarDialogComponent } from './north-star-page/new-north-start-dialog/new-north-start-dialog.component';

@NgModule({
  declarations: [
    // Pulse Component
    PulseComponent,
    NorthStarPageComponent,
    NewNorthStarDialogComponent,
    DashboardPageComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    WorkRoutingModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class WorkModule { }
