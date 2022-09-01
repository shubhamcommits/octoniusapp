import { Component, Injector, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { WidgetSelectorDialogComponent } from 'src/app/common/shared/dashboard/widget-selector-dialog/widget-selector-dialog.component';
import { ColumnService } from 'src/shared/services/column-service/column.service';
import { UserService } from 'src/shared/services/user-service/user.service';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss']
})
export class DashboardPageComponent implements OnInit {

  period = 7;

  periods = [
    {
     key: 7,
     value: $localize`:@@workDahsboardPage.last7Days:Last 7 days`
    },
    {
     key: 30,
     value: $localize`:@@workDahsboardPage.lastMonth:Last month`
    },
    {
     key: 365,
     value: $localize`:@@workDahsboardPage.lastYear:Last year`
    }
  ];

  groupsList;
  filteringGroups: any;

  userData: any;
  workspaceData: any;

  // Projects
  projects: any = [];
  filteringProjects: any;

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private columnService: ColumnService,
    private injector: Injector,
    public dialog: MatDialog) { }

  async ngOnInit() {
    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'work'
    });

    // Fetch current user details
    this.userData = await this.publicFunctions.getCurrentUser();
    if (!this.userData.selected_widgets) {
      this.userData.selected_widgets = ['WORK_STATISTICS', 'WORKLOAD', 'VELOCITY'/*, 'PULSE'*/, 'PEOPLE_DIRECTORY', 'ORGANIZATIONAL_STRUCTURE', 'WORK_STATISTICS_NORTH_STAR', 'ENGAGEMENT', 'KPI_PERFORMANCE'];
    }

    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    // Fetches the user groups from the server
    this.groupsList = await this.publicFunctions.getAllManagerGroups(this.workspaceData['_id'], this.userData['_id'])
      .catch(()=>{
        // If the function breaks, then catch the error and console to the application
        this.publicFunctions.sendError(new Error($localize`:@@workDahsboardPage.unableToConnectToServer:Unable to connect to the server, please try again later!`));
      });

    // Fetches the groups from the server
    this.projects = await this.getProjectColumns()
      .catch(() => {
        // If the function breaks, then catch the error and console to the application
        this.publicFunctions.sendError(new Error($localize`:@@workDahsboardPage.unableToConnectToServer:Unable to connect to the server, please try again later!`));
      });

    this.period = (this.userData.stats.dashboard_period) ? this.userData.stats.dashboard_period : 7;
  }

  async periodSelected(event) {
    this.period = event.value;
    this.userData.stats.dashboard_period = this.period;
    // User service
    const userService = this.injector.get(UserService);

    // Update user´s period
    await userService.updateUser(this.userData);
    await this.publicFunctions.sendUpdatesToUserData(this.userData);
  }

  async groupsSelected(event) {
    this.filteringGroups = event.value;

    this.projects = await this.getProjectColumns();
    if (!this.filteringProjects || this.filteringProjects) {
      this.filteringProjects = this.projects;
    }
  }

  async projectsSelected(event) {
    this.filteringProjects = event.value;

    if (!this.filteringProjects || this.filteringProjects) {
      this.filteringProjects = this.projects;
    }
  }

  openWidgetSelectorDialog() {

    const data = {
      userId: this.userData._id,
      selectedWidgets: this.userData.selected_widgets
    }

    const dialogRef = this.dialog.open(WidgetSelectorDialogComponent, {
      data: data,
      panelClass: 'groupCreatePostDialog',
      width: '50%',
      disableClose: true,
      hasBackdrop: true
    });

    const saveEventSubs = dialogRef.componentInstance.saveEvent.subscribe((data) => {
      this.userData.selected_widgets = data;
    });

    const closeEventSubs = dialogRef.componentInstance.cancelEvent.subscribe(async (data) => {
      this.userData.selected_widgets = data;
    });

    dialogRef.afterClosed().subscribe(result => {
      saveEventSubs.unsubscribe();
      closeEventSubs.unsubscribe();
    });
  }

  /**
   * This function is resposible for fetching project columns present in the workplace
   */
  async getProjectColumns() {
    if (this.filteringGroups && this.filteringGroups.length > 0) {
      const filteringGroupsTmp = this.filteringGroups.map(group => (group._id || group));

      return new Promise((resolve, reject) => {
        this.columnService.getGroupProjectColumnsByGroups(this.workspaceData._id, filteringGroupsTmp)
          .then((res) => resolve(res['columns']))
          .catch(() => reject([]));
      });
    } else {
      return new Promise(async (resolve, reject) => {
        this.columnService.getAllProjectColumns(this.workspaceData._id, this.userData._id)
          .then((res) => resolve(res['columns']))
          .catch(() => reject([]));
      });
    }
  }
}
