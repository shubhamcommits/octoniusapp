import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganizationHRRoutingModule } from './organization-hr-routing.module';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/common/shared/shared.module';
import { OrganizationHRComponent } from './organization-hr.component';
import { TimneOffComponent } from './time-off/time-off.component';
import { EmployeesComponent } from './employees/employees.component';
import { SetupComponent } from './setup/setup.component';
import { NewEntityComponent } from './setup/new-entity/new-entity.component';
import { EditEntityDialogComponent } from './setup/edit-entity-dialog/edit-entity-dialog.component';
import { EditMemberPayrollDialogComponent } from './employees/edit-member-payroll-dialog/edit-member-payroll-dialog.component';
import { UserTimeOffDialogComponent } from './time-off/user-time-off-dialog/user-time-off-dialog.component';


@NgModule({
  declarations: [
    OrganizationHRComponent,
    TimneOffComponent,
    UserTimeOffDialogComponent,
    EmployeesComponent,
    SetupComponent,
    NewEntityComponent,
    EditEntityDialogComponent,
    EditMemberPayrollDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    OrganizationHRRoutingModule,
    SharedModule
  ],
  exports: [
  ]
})
export class OrganizationHRModule { }
