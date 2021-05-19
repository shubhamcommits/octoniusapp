import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminGeneralComponent } from './admin-general/admin-general.component';
import { AdminMembersComponent } from './admin-members/admin-members.component';
import { AdminBillingComponent } from './admin-billing/admin-billing.component';
import { DenyNavigationGuard } from 'src/shared/guards/deny-navigation-guard/deny-navigation.guard';
import { ActivateBillingGuard } from 'src/shared/guards/activate-billing-guard/activate-billing.guard';


const routes: Routes = [
  { path: 'general', component: AdminGeneralComponent, canActivate: [DenyNavigationGuard] },
  { path: 'members', component: AdminMembersComponent, canActivate: [DenyNavigationGuard] },
  { path: 'billing', component: AdminBillingComponent, canActivate: [ActivateBillingGuard], canDeactivate: [DenyNavigationGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [DenyNavigationGuard]
})
export class AdminRoutingModule { }
