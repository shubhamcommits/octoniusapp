import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CalendarRoutingModule } from './calendar-routing.module';

import { GroupCalendarComponent } from './group-calendar/group-calendar.component';

import { FormsModule } from '@angular/forms';
import { CalendarModule as Calendar, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { SharedModule } from 'src/app/common/shared/shared.module';

@NgModule({
  declarations: [
    GroupCalendarComponent
  ],
  imports: [
    CommonModule,

    CalendarRoutingModule,

    FormsModule,

    SharedModule,

    Calendar.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
  ]
})
export class CalendarModule { }
