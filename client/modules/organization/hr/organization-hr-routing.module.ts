import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OrganizationHRComponent } from './organization-hr.component';
import { EmployeesComponent } from './employees/employees.component';
import { SetupComponent } from './setup/setup.component';
import { TimneOffComponent } from './time-off/time-off.component';

const routes: Routes = [
  {
    path: '', component: OrganizationHRComponent,
    data: {
      preload: false,
      state: 'hive-hr'
    }
  },
  {
    path: 'timeoff', component: TimneOffComponent,
    data: {
      preload: false,
      state: 'hive-hr-timeoff'
    }
  },
  {
    path: 'setup', component: SetupComponent,
    data: {
      preload: false,
      state: 'hive-hr-setup'
    }
  },
  {
    path: 'employees', component: EmployeesComponent,
    data: {
      preload: false,
      state: 'hive-hr-employees'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizationHRRoutingModule { }
