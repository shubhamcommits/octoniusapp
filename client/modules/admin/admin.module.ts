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
import { WorkplaceProfileCustomFieldsComponent } from './admin-general/workplace-profile-custom-fields/workplace-profile-custom-fields.component';
import { ProfileCustomFieldsDialogComponent } from './admin-general/workplace-profile-custom-fields/profile-custom-fields-dialog/profile-custom-fields-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { AdminGroupsComponent } from './admin-groups/admin-groups.component';
import { MatTabsModule } from '@angular/material/tabs';
import { WorkspaceRolesInformationDialogComponent } from './admin-general/workspace-roles-information-dialog/workspace-roles-information-dialog.component';
import { WorkplaceIntegrationsComponent } from './admin-general/workplace-integrations/workplace-integrations.component';
import { WorkplaceIntegrationsDialogComponent } from './admin-general/workplace-integrations/workplace-integrations-dialog/workplace-integrations-dialog.component';


@NgModule({
  declarations: [
    AdminGeneralComponent,
    AdminMembersComponent,
    AdminGroupsComponent,
    AdminBillingComponent,
    AdminHeaderComponent,
    WorkplaceInformationComponent,
    WorkplaceAddDomainComponent,
    WorkplaceInviteUserComponent,
    StripePaymentComponent,
    StartSubscriptionComponent,
    TransferOwnershipComponent,
    WorkplaceProfileCustomFieldsComponent,
    ProfileCustomFieldsDialogComponent,
    WorkspaceRolesInformationDialogComponent,
    WorkplaceIntegrationsComponent,
    WorkplaceIntegrationsDialogComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    SharedModule,
    MatDialogModule,
    MatTabsModule
  ],
  providers:[WorkspaceService, AdminService, ActivateBillingGuard],
  entryComponents: [
    ProfileCustomFieldsDialogComponent,
    WorkspaceRolesInformationDialogComponent,
    WorkplaceIntegrationsDialogComponent
  ]
})
export class AdminModule { }
