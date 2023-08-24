import { Component, OnInit, Injector, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PublicFunctions } from 'modules/public.functions';
import { HRService } from 'src/shared/services/hr-service/hr.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { UserTimeOffDialogComponent } from './user-time-off-dialog/user-time-off-dialog.component';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-time-off',
  templateUrl: './time-off.component.html',
  styleUrls: ['./time-off.component.scss']
})
export class TimneOffComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  workspaceData;

  membersOff = [];

  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = ['photo', 'first_name', 'last_name', 'email', 'start_date', 'end_date', 'star'];

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  // Utility Service
  public utilityService = this.injector.get(UtilityService);

  constructor(
    private hrService: HRService,
    private injector: Injector,
    public dialog: MatDialog
  ) { }

  async ngOnInit() {
    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'hive-hr-timeoff'
    });

    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    this.initUsersTable();
  }

  initUsersTable() {
    const today = DateTime.now();
    const from = today.startOf('week');
    const to = today.endOf('week');
    const members = (!!this.workspaceData.members) ? this.workspaceData.members.map(member => member._id) : [];
    this.hrService.getMembersOff(members, from, to).then(res => {
      this.membersOff = res['members'];
      
      // Assign the data to the data source for the table to render
      this.dataSource = new MatTableDataSource(this.membersOff);

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

  openCalendar(userId: string) {
    const dialogRef = this.dialog.open(UserTimeOffDialogComponent, {
      data: {
        userId: userId
      },
      width: '75%',
      // height: '95%',
      disableClose: true,
      hasBackdrop: true
    });

    // const memberEditedEventSubs = dialogRef.componentInstance.memberEditedEvent.subscribe((data) => {
    //   this.initUsersTable();
    // });

    dialogRef.afterClosed().subscribe(result => {
      // memberEditedEventSubs.unsubscribe();
    });
  }

  formateDate(date: any) {
    if (!!date && (date instanceof DateTime)) {
      return date.toLocaleString(DateTime.DATE_SHORT);
    }
    return (!!date) ? DateTime.fromISO(date).toLocaleString(DateTime.DATE_SHORT) : '';
  }
}
