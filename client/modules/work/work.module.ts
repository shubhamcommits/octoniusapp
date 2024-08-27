import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkRoutingModule } from './work-routing.module';

import { PulseComponent } from './pulse/pulse.component'
import { SharedModule } from 'src/app/common/shared/shared.module';
import { NorthStarPageComponent } from './north-star-page/north-star-page.component';
import { DashboardPageComponent } from './dashboard-page/dashboard-page.component';

import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NewNorthStarDialogComponent } from './north-star-page/new-north-start-dialog/new-north-start-dialog.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SearchTaskDialogComponent } from './north-star-page/search-task-dialog/search-task-dialog.component';
import { CRMSetupPageComponent } from './crm-setup-page/crm-setup-page.component';
import { NewCRMContactDialogComponent } from './crm-setup-page/new-crm-contact-dialog/new-crm-contact-dialog.component';
import { CRMContactDialogComponent } from './crm-setup-page/crm-contact-dialog/crm-contact-dialog.component';
import { CRMContactInformationComponent } from './crm-setup-page/new-crm-contact-dialog/crm-contact-information/crm-contact-information.component';
import { CRMContactCustomFieldsComponent } from './crm-setup-page/new-crm-contact-dialog/crm-contact-custom-fields/crm-contact-custom-fields.component';
import { CRMCompanyCustomFieldsComponent } from './crm-setup-page/new-crm-company-dialog/crm-company-custom-fields/crm-company-custom-fields.component';
import { CRMContactCompaniesComponent } from './crm-setup-page/new-crm-contact-dialog/crm-contact-companies/crm-contact-companies.component';
import { NewCRMCompanyDialogComponent } from './crm-setup-page/new-crm-company-dialog/new-crm-company-dialog.component';
import { CRMCompanyInformationComponent } from './crm-setup-page/new-crm-company-dialog/crm-company-information/crm-company-information.component';
import { CRMCompanyImageDialogComponent } from './crm-setup-page/new-crm-company-dialog/crm-company-image-dialog/crm-company-image-dialog.component';
import { NewCRMProductDialogComponent } from './crm-setup-page/new-crm-product-dialog/new-crm-product-dialog.component';
import { CRMProductCustomFieldsComponent } from './crm-setup-page/new-crm-product-dialog/crm-product-custom-fields/crm-product-custom-fields.component';
import { CRMProductInformationComponent } from './crm-setup-page/new-crm-product-dialog/crm-product-information/crm-product-information.component';
import { MatDialogModule } from '@angular/material/dialog';
import { CRMCustomFieldsDialogComponent } from './crm-setup-page/crm-custom-fields-dialog/crm-custom-fields-dialog.component';
import { CRMSetupBoardBarComponent } from './crm-setup-page/crm-setup-board-bar/crm-setup-board-bar.component';

@NgModule({
  declarations: [
    // Pulse Component
    PulseComponent,
    NorthStarPageComponent,
    CRMSetupPageComponent,
    NewCRMContactDialogComponent,
    CRMContactDialogComponent,
    CRMContactInformationComponent,
    CRMContactCustomFieldsComponent,
    CRMCompanyCustomFieldsComponent,
    CRMContactCompaniesComponent,
    NewCRMCompanyDialogComponent,
    CRMCompanyInformationComponent,
    CRMCompanyImageDialogComponent,
    NewCRMProductDialogComponent,
    CRMProductCustomFieldsComponent,
    CRMProductInformationComponent,
    CRMSetupBoardBarComponent,
    CRMCustomFieldsDialogComponent,
    NewNorthStarDialogComponent,
    SearchTaskDialogComponent,
    DashboardPageComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatProgressBarModule,
    MatSelectModule,
    ReactiveFormsModule,
    SharedModule,
    WorkRoutingModule,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class WorkModule { }
