import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LibraryRoutingModule } from './library-routing.module';

import { SharedModule } from 'src/app/common/shared/shared.module';

import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CollectionsComponent } from './collections/collections.component';
import { CollectionNewElementComponent } from './collections/collection-new-element/collection-new-element.component';
import { CollectionDetailsComponent } from './collection-details/collection-details.component';
import { CollectionHeaderComponent } from './collection-details/collection-header/collection-header.component';
import { PageRowComponent } from './collection-details/page-row/page-row.component';
import { CollectionNavbarComponent } from './collection-navbar/collection-navbar.component';
import { CollectionImageDetailsComponent } from './collection-navbar/collection-image-details/collection-image-details.component';
import { PageNavbarComponent } from './page-navbar/page-navbar.component';
import { PageDetailsComponent } from './page-details/page-details.component';
import { CollectionPagesComponent } from './page-details/collection-pages/collection-pages.component';
import { PageActionsBarComponent } from './page-details/page-actions-bar/page-actions-bar.component';
import { LikePageComponent } from './page-details/page-actions-bar/like-page/like-page.component';
import { ConfluenceImportDialogComponent } from './collections/collection-new-element/confluence-import-dialog/confluence-import-dialog.component';

@NgModule({
  declarations: [
    CollectionsComponent,
    CollectionNewElementComponent,
    CollectionNavbarComponent,
    CollectionDetailsComponent,
    CollectionHeaderComponent,
    ConfluenceImportDialogComponent,
    PageRowComponent,
    CollectionImageDetailsComponent,
    PageNavbarComponent,
    PageDetailsComponent,
    CollectionPagesComponent,
    PageActionsBarComponent,
    LikePageComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    LibraryRoutingModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class LibraryModule { }
