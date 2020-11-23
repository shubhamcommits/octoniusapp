import { Component, Injector, ViewChild, OnInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { PublicFunctions } from 'src/app/shared/public.functions';
import { WorkspaceService } from 'src/app/shared/services/workspace-service/workspace.service';
import { environment } from 'src/environments/environment';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { UtilityService } from 'src/app/shared/services/utility-service/utility.service';


@Component({
  selector: 'app-list-workspaces-page',
  templateUrl: './list-workspaces-page.component.html',
  styleUrls: ['./list-workspaces-page.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ListWorkspacesPageComponent implements OnInit {

  displayedColumns: string[] = ['id', 'workspace_name', 'owner', 'owner_email', 'star'];
  dataSource: MatTableDataSource<any>;

  isExpansionDetailRow = (i: number, row: Object) => row.hasOwnProperty('detailRow');
  expandedElement: any;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  // Base URL of the uploads
  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  workspaces = [];

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private workspaceService: WorkspaceService,
    private utilityService: UtilityService,
    private injector: Injector) {

  }

  async ngOnInit() {
    this.workspaceService.getWorkspaces().subscribe(async res => {
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

  expandDetails(workspace: any) {
    this.workspaceService.getNumberGroupsByWorkspace(workspace._id).then(res => {
      workspace.num_groups = res['num_groups'];

      this.expandedElement = this.expandedElement === workspace ? null : workspace;
    });
  }

  deleteWorkspace(workspaceId: string) {
    this.utilityService.getConfirmDialogAlert('Are you sure?', 'By doing this, the workspace be completely removed!')
      .then((res) => {
        if (res.value) {
          this.workspaceService.removeWorkspace(workspaceId).then(res => {
            if (res['message']) {
              let message = res['message'];
              console.log(message);
              this.utilityService.getSwalModal({
                title: "Delete Workspace",
                text: message,
                inputAttributes: {
                  maxlength: 20,
                  autocapitalize: 'off',
                  autocorrect: 'off'
                },
                showCancelButton: false
              });
            }
          });
        }
      });
  }
}
