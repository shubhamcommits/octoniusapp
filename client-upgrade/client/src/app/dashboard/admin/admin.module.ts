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

import { WorkplaceInformationComponent } from './admin-general/workplace-information/workplace-information.component';
import { WorkplaceAddDomainComponent } from './admin-general/workplace-add-domain/workplace-add-domain.component';
import { WorkplaceInviteUserComponent } from './admin-general/workplace-invite-user/workplace-invite-user.component';
import { AdminService } from 'src/shared/services/admin-service/admin.service';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    AdminGeneralComponent, 
    AdminMembersComponent, 
    AdminBillingComponent, 
    AdminHeaderComponent, 
    WorkspaceDetailsComponent, 
    WorkplaceInformationComponent, 
    WorkplaceAddDomainComponent, 
    WorkplaceInviteUserComponent],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    SharedModule
  ],
  providers:[WorkspaceService, AdminService]
})
export class AdminModule { }
