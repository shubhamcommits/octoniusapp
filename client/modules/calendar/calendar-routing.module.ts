import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GroupCalendarComponent } from './group-calendar/group-calendar.component';


const routes: Routes = [
  { path: '', component: GroupCalendarComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CalendarRoutingModule { }
