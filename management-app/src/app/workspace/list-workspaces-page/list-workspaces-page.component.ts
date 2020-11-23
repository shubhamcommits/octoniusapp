import { Component, Injector, ViewChild, OnInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { PublicFunctions } from 'src/app/shared/public.functions';
import { WorkspaceService } from 'src/app/shared/services/workspace-service/workspace.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-list-workspaces-page',
  templateUrl: './list-workspaces-page.component.html',
  styleUrls: ['./list-workspaces-page.component.scss']
})
export class ListWorkspacesPageComponent implements OnInit {

  displayedColumns: string[] = ['id', 'workspace_name', 'owner', 'owner_email', 'star'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  // Base URL of the uploads
  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  workspaces = [];

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private workspaceService: WorkspaceService,
    private injector: Injector) {

  }

  ngOnInit() {
    this.workspaceService.getWorkspaces().subscribe(res => {
      this.workspaces = res['workspaces'];

      // Assign the data to the data source for the table to render
      this.dataSource = new MatTableDataSource(this.workspaces);

      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
