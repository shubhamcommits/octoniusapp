import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { WidgetSelectorDialogComponent } from 'src/app/common/shared/dashboard/widget-selector-dialog/widget-selector-dialog.component';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-group-dashboard',
  templateUrl: './group-dashboard.component.html',
  styleUrls: ['./group-dashboard.component.scss']
})
export class GroupDashboardComponent implements OnInit, OnDestroy {

  groupData: any;

  period = 7;

  periods = [
    {
     key: 7,
     value: 'Last 7 days'
    },
    {
     key: 30,
     value: 'Last month'
    },
    {
     key: 365,
     value: 'Last year'
    }
  ];

  userData: any;

  // Subsink Object
  subSink = new SubSink()

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private injector: Injector,
    private utilityService: UtilityService,
    public dialog: MatDialog) { }

  async ngOnInit() {
    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'group'
    });

    this.subSink.add(this.utilityService.currentGroupData.subscribe((res) => {
      if (JSON.stringify(res) != JSON.stringify({})) {

        // Assign the GroupData
        this.groupData = res;
        if (!this.groupData.selected_widgets) {
          this.groupData.selected_widgets = ['WORK_STATISTICS', 'WORKLOAD', 'VELOCITY', 'ENGAGEMENT', 'KPI_PERFORMANCE', 'RESOURCE_MANAGEMENT'];
        }
      }
    }))

    // Fetch current user details
    this.userData = await this.publicFunctions.getCurrentUser();

    this.period = (this.userData.stats.group_dashboard_period) ? this.userData.stats.group_dashboard_period : 7;
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subSink.unsubscribe();
  }

  async periodSelected(event) {
    this.period = event.value;
    this.userData.stats.group_dashboard_period = this.period;
    // User service
    const userService = this.injector.get(UserService);

    // Update user´s period
    await userService.updateUser(this.userData);
    await this.publicFunctions.sendUpdatesToUserData(this.userData);
  }

  openWidgetSelectorDialog() {

    const data = {
      groupId: this.groupData._id,
      groupProjectType: this.groupData.project_type,
      selectedWidgets: this.groupData.selected_widgets,
      resource_management_allocation: this.groupData.resource_management_allocation,
      groupEnableAllocation: this.groupData.enable_allocation
    }

    const dialogRef = this.dialog.open(WidgetSelectorDialogComponent, {
      data: data,
      panelClass: 'groupCreatePostDialog',
      width: '50%',
      disableClose: true,
      hasBackdrop: true
    });

    const saveEventSubs = dialogRef.componentInstance.saveEvent.subscribe((data) => {
      this.groupData.selected_widgets = data;
    });

    const enableAllocationEventSubs = dialogRef.componentInstance.enableAllocationEvent.subscribe((data) => {
      this.groupData.resource_management_allocation = data;
    });

    const closeEventSubs = dialogRef.componentInstance.cancelEvent.subscribe(async (data) => {
      this.groupData.selected_widgets = data;
    });


    dialogRef.afterClosed().subscribe(result => {
      enableAllocationEventSubs.unsubscribe();
      saveEventSubs.unsubscribe();
      closeEventSubs.unsubscribe();
    });
  }

}
