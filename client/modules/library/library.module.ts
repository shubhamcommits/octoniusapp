import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LibraryRoutingModule } from './library-routing.module';

import { SharedModule } from 'src/app/common/shared/shared.module';

import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
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

@NgModule({
  declarations: [
    CollectionsComponent,
    CollectionNewElementComponent,
    CollectionNavbarComponent,
    CollectionDetailsComponent,
    CollectionHeaderComponent,
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
    FormsModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class LibraryModule { }
