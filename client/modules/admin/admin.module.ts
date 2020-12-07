import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { SharedModule } from 'src/app/common/shared/shared.module';

import { AdminGeneralComponent } from './admin-general/admin-general.component';
import { AdminMembersComponent } from './admin-members/admin-members.component';
import { AdminBillingComponent } from './admin-billing/admin-billing.component';
import { AdminHeaderComponent } from './admin-header/admin-header.component';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';

import { WorkplaceInformationComponent } from './workplace-information/workplace-information.component';
import { WorkplaceAddDomainComponent } from './admin-general/workplace-add-domain/workplace-add-domain.component';
import { WorkplaceInviteUserComponent } from './admin-general/workplace-invite-user/workplace-invite-user.component';
import { AdminService } from 'src/shared/services/admin-service/admin.service';
import { FormsModule } from '@angular/forms';
import { MomentModule } from "ngx-moment";
import { StripePaymentComponent } from './admin-billing/stripe-payment/stripe-payment.component';
import { StartSubscriptionComponent } from './admin-billing/stripe-payment/start-subscription/start-subscription.component';
import { SubscriptionDetailsComponent } from './admin-billing/stripe-payment/subscription-details/subscription-details.component';


@NgModule({
  declarations: [
    AdminGeneralComponent,
    AdminMembersComponent,
    AdminBillingComponent,
    AdminHeaderComponent,
    WorkplaceInformationComponent,
    WorkplaceAddDomainComponent,
    WorkplaceInviteUserComponent, StripePaymentComponent, StartSubscriptionComponent, SubscriptionDetailsComponent],
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
