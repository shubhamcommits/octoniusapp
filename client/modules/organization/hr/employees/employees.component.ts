import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, Injector, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { EditMemberPayrollDialogComponent } from './edit-member-payroll-dialog/edit-member-payroll-dialog.component';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class EmployeesComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  userData;
  workspaceData;

  users = [];

  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = ['photo', 'first_name', 'last_name', 'email', 'job', 'cost', 'star'];

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  // Utility Service
  public utilityService = this.injector.get(UtilityService);

  constructor(
    private workspaceService: WorkspaceService,
    private injector: Injector,
    public dialog: MatDialog
  ) { }

  async ngOnInit() {
    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'hive-hr-employees'
    });

    this.userData = await this.publicFunctions.getCurrentUser();
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    this.initUsersTable();
  }

  initUsersTable() {
    this.workspaceService.getWorkspaceUsers(this.workspaceData?._id).then(res => {
      this.users = res['users'];
      
      // Assign the data to the data source for the table to render
      this.dataSource = new MatTableDataSource(this.users);

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

  openMemberDialog(userId: string) {
    const dialogRef = this.dialog.open(EditMemberPayrollDialogComponent, {
      data: {
        memberId: userId
      },
      width: '65%',
      height: '75%',
      disableClose: true,
      hasBackdrop: true
    });

    const memberEditedEventSubs = dialogRef.componentInstance.memberEditedEvent.subscribe((data) => {
      this.initUsersTable();
    });

    dialogRef.afterClosed().subscribe(result => {
      memberEditedEventSubs.unsubscribe();
    });
  }
}
