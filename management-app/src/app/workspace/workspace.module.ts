import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { WorkspaceRoutingModule } from './workspace-routing.module';
import { ListWorkspacesPageComponent } from './list-workspaces-page/list-workspaces-page.component';

@NgModule({
  declarations: [
    ListWorkspacesPageComponent
  ],
  imports: [
    CommonModule,
    WorkspaceRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class WorkspaceModule { }
