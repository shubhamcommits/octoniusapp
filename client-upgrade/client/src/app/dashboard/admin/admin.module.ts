import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminGeneralComponent } from './admin-general/admin-general.component';
import { AdminMembersComponent } from './admin-members/admin-members.component';
import { AdminBillingComponent } from './admin-billing/admin-billing.component';


@NgModule({
  declarations: [AdminGeneralComponent, AdminMembersComponent, AdminBillingComponent],
  imports: [
    CommonModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
