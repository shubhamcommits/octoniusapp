import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminGeneralComponent } from './admin-general/admin-general.component';
import { AdminMembersComponent } from './admin-members/admin-members.component';
import { AdminBillingComponent } from './admin-billing/admin-billing.component';
import { AdminHeaderComponent } from './admin-header/admin-header.component';


const routes: Routes = [
  { path:'', component: AdminHeaderComponent, children:[
    { path: 'general', component: AdminGeneralComponent },
    { path: 'members', component: AdminMembersComponent },
    { path: 'billing', component: AdminBillingComponent }
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
