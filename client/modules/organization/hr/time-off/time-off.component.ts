import { Component, OnInit, Injector, ViewChild } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
import { MatSort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { PublicFunctions } from 'modules/public.functions';
import { HRService } from 'src/shared/services/hr-service/hr.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { UserTimeOffDialogComponent } from './user-time-off-dialog/user-time-off-dialog.component';
import { DateTime } from 'luxon';
import { DatesService } from 'src/shared/services/dates-service/dates.service';

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

  selectedDate = DateTime.now();
  months = [];

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  // Utility Service
  public utilityService = this.injector.get(UtilityService);

  constructor(
    private hrService: HRService,
    private injector: Injector,
    private datesService: DatesService,
    public dialog: MatDialog
  ) { }

  async ngOnInit() {
    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'hive-hr-timeoff'
    });

    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    this.initMonths();

    this.initUsersTable(DateTime.now());
  }

  initMonths() {
    const today = DateTime.now();
    this.selectedDate = today;
    this.months = [
      today.set({ month: 1 }),
      today.set({ month: 2 }),
      today.set({ month: 3 }),
      today.set({ month: 4 }),
      today.set({ month: 5 }),
      today.set({ month: 6 }),
      today.set({ month: 7 }),
      today.set({ month: 8 }),
      today.set({ month: 9 }),
      today.set({ month: 10 }),
      today.set({ month: 11 }),
      today.set({ month: 12 })
    ]
  }

  initUsersTable(date: DateTime) {
    const from = date.startOf('month');
    const to = date.endOf('month');

    const membersIds = (!!this.workspaceData.members) ? this.workspaceData.members.map(member => member._id) : [];
    this.hrService.getMembersOff(membersIds, from, to, true).then(res => {
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

  changeMonth(monthSelected: any) {
console.log(this.selectedDate);
    this.initUsersTable(monthSelected);
  }

  formateDate(date: any) {
    if (!!date && (date instanceof DateTime)) {
      return date.toLocaleString(DateTime.DATE_SHORT);
    }
    return this.datesService.formateDate(date, DateTime.DATE_SHORT);
  }

  displayMonth(date: any) {
    if (!!date && (date instanceof DateTime)) {
      return date.toFormat('LLLL yyyy');
    }
    return (!!date) ? DateTime.fromISO(date).toFormat('LLLL yyyy') : '';
  }
}
