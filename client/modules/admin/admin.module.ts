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
import { StripePaymentComponent } from './admin-billing/stripe-payment/stripe-payment.component';
import { StartSubscriptionComponent } from './admin-billing/stripe-payment/start-subscription/start-subscription.component';
import { TransferOwnershipComponent } from './admin-general/transfer-ownership/transfer-ownership.component';
import { ActivateBillingGuard } from 'src/shared/guards/activate-billing-guard/activate-billing.guard';


@NgModule({
  declarations: [
    AdminGeneralComponent,
    AdminMembersComponent,
    AdminBillingComponent,
    AdminHeaderComponent,
    WorkplaceInformationComponent,
    WorkplaceAddDomainComponent,
    WorkplaceInviteUserComponent,
    StripePaymentComponent,
    StartSubscriptionComponent,
    TransferOwnershipComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    SharedModule
  ],
  providers:[WorkspaceService, AdminService, ActivateBillingGuard]
})
export class AdminModule { }
