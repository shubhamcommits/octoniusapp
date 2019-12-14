import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { SharedModule } from 'src/app/common/shared/shared.module';

import { AdminGeneralComponent } from './admin-general/admin-general.component';
import { AdminMembersComponent } from './admin-members/admin-members.component';
import { AdminBillingComponent } from './admin-billing/admin-billing.component';
import { AdminHeaderComponent } from './admin-header/admin-header.component';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { WorkspaceDetailsComponent } from './admin-header/workspace-details/workspace-details.component';

import { WorkplaceInformationComponent } from './workplace-information/workplace-information.component';
import { WorkplaceAddDomainComponent } from './admin-general/workplace-add-domain/workplace-add-domain.component';
import { WorkplaceInviteUserComponent } from './admin-general/workplace-invite-user/workplace-invite-user.component';
import { AdminService } from 'src/shared/services/admin-service/admin.service';
import { FormsModule } from '@angular/forms';
import { MomentModule } from "ngx-moment";
import { StripePaymentComponent } from './admin-billing/stripe-payment/stripe-payment.component';


@NgModule({
  declarations: [
    AdminGeneralComponent, 
    AdminMembersComponent, 
    AdminBillingComponent, 
    AdminHeaderComponent, 
    WorkspaceDetailsComponent, 
    WorkplaceInformationComponent, 
    WorkplaceAddDomainComponent, 
    WorkplaceInviteUserComponent, StripePaymentComponent],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    MomentModule,
    SharedModule
  ],
  providers:[WorkspaceService, AdminService]
})
export class AdminModule { }
