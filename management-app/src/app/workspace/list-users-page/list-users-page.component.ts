import { Component, Injector, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { PublicFunctions } from 'src/app/shared/public.functions';
import { environment } from 'src/environments/environment';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { UtilityService } from 'src/app/shared/services/utility-service/utility.service';
import { UserService } from 'src/app/shared/services/user-service/user.service';
import { SubSink } from 'subsink';


@Component({
  selector: 'app-list-users-page',
  templateUrl: './list-users-page.component.html',
  styleUrls: ['./list-users-page.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ListUsersPageComponent implements OnInit, OnDestroy {

  displayedColumns: string[] = ['id', 'first_name', 'last_name', 'email', 'workspace_name', 'portal_manager', 'star'];
  dataSource: MatTableDataSource<any>;

  isExpansionDetailRow = (i: number, row: Object) => row.hasOwnProperty('detailRow');
  expandedElement: any;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  // Base URL of the uploads
  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  users = [];

  currentUser;

  // UNSUBSCRIBE THE DATA
  private subSink = new SubSink();

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private userService: UserService,
    private utilityService: UtilityService,
    private injector: Injector) {

  }

  async ngOnInit() {
    this.subSink.add(
      this.utilityService.currentUserData
        .subscribe(res => this.currentUser = res)
    );

    this.initUsersTable();
  }

  initUsersTable() {
    this.userService.getAllUsers().subscribe(async res => {
      this.users = res['users'];

      // Assign the data to the data source for the table to render
      this.dataSource = new MatTableDataSource(this.users);

      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  /**
   * This functions unsubscribes all the observables subscription to avoid memory leak
   */
  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  expandDetails(workspace: any) {
    this.expandedElement = this.expandedElement === workspace ? null : workspace;
  }

  makeUserPortalManager(userId: string, isPortalManager: boolean) {
    this.utilityService.getConfirmDialogAlert('Are you sure?', 'By doing this, the user be able to access the Portal Manager Application!')
      .then((res) => {
        if (res.value) {
          this.utilityService.asyncNotification('Please wait we are updating the user´s role...', new Promise((resolve, reject) => {
            // Remove the step
            this.userService.makeUserPortalManager(userId, !isPortalManager)
              .then((res) => {
                  this.initUsersTable();

                  resolve(this.utilityService.resolveAsyncPromise('User updated!'));
              }).catch((err) => {
                reject(this.utilityService.rejectAsyncPromise('Unable to update user, please try again!'));
              });
          }));
        }
      });
  }

  deleteUser(userId: string) {
    this.utilityService.getConfirmDialogAlert('Are you sure?', 'By doing this, the user be completely removed!')
      .then((res) => {
        if (res.value) {
          this.utilityService.asyncNotification('Please wait we are deleting the user...', new Promise((resolve, reject) => {
            // Remove the step
            this.userService.removeUser(userId)
              .then((res) => {
                  this.initUsersTable();

                  resolve(this.utilityService.resolveAsyncPromise('User deleted!'));
              }).catch((err) => {
                reject(this.utilityService.rejectAsyncPromise(err.error.message));
              });
          }));
        }
      });
  }
}
