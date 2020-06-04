import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkRoutingModule } from './work-routing.module';

import { PulseComponent } from './pulse/pulse.component'
import { SharedModule } from 'src/app/common/shared/shared.module';


@NgModule({
  declarations: [

    // Pulse Component
    PulseComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    WorkRoutingModule
  ]
})
export class WorkModule { }
