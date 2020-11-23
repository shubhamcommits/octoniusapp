import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { WorkspaceRoutingModule } from './workspace-routing.module';
import { ListWorkspacesPageComponent } from './list-workspaces-page/list-workspaces-page.component';
import { ListUsersPageComponent } from './list-users-page/list-users-page.component';

@NgModule({
  declarations: [
    ListWorkspacesPageComponent,
    ListUsersPageComponent
  ],
  imports: [
    CommonModule,
    WorkspaceRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatMenuModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class WorkspaceModule { }
