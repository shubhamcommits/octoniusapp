import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminGeneralComponent } from './admin-general/admin-general.component';
import { AdminMembersComponent } from './admin-members/admin-members.component';
import { AdminBillingComponent } from './admin-billing/admin-billing.component';
import { AdminHeaderComponent } from './admin-header/admin-header.component';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { WorkspaceDetailsComponent } from './admin-header/workspace-details/workspace-details.component';
import { CropImageComponent } from 'src/app/common/crop-image/crop-image.component';
import { ImageCropperModule } from 'ngx-image-cropper';


@NgModule({
  declarations: [AdminGeneralComponent, AdminMembersComponent, AdminBillingComponent, AdminHeaderComponent, CropImageComponent, WorkspaceDetailsComponent],
  imports: [
    CommonModule,
    AdminRoutingModule,
    ImageCropperModule
  ],
  providers:[WorkspaceService]
})
export class AdminModule { }
