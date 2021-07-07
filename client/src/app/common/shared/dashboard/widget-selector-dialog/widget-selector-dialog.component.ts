import { Component, EventEmitter, Inject, Injector, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-widget-selector-dialog',
  templateUrl: './widget-selector-dialog.component.html',
  styleUrls: ['./widget-selector-dialog.component.scss']
})
export class WidgetSelectorDialogComponent implements OnInit {

  @Output() saveEvent = new EventEmitter();
  @Output() enableAllocationEvent = new EventEmitter();
  @Output() cancelEvent = new EventEmitter();


  groupId;
  groupProjectType;
  userId;

  selectedWidgets = [];
  newSelectedWidgets = [];
  initSelectedWidgets = [];
  groupEnableAllocation = false;
  resource_management_allocation = false;

  availableWidgets= [];

  groupAvailableWidgets = [
    {
      code: 'WORK_STATISTICS',
      name: 'Work statistics',
      img: 'assets/images/widgets/widget-work-stats.png'
    }, {
      code: 'WORKLOAD',
      name: 'Workload by completition status',
      img: 'assets/images/widgets/widget-workload.png'
    }, {
      code: 'VELOCITY',
      name: 'Velocity over time',
      img: 'assets/images/widgets/widget-velocity.png'
    }, {
      code: 'ENGAGEMENT',
      name: 'Engagement',
      img: 'assets/images/widgets/widget-engagement.png'
    }, {
      code: 'RESOURCE_MANAGEMENT',
      name: 'Resource management',
      img: 'assets/images/widgets/widget-resources.png'
    }
  ];

  globalAvailableWidgets = [
    {
      code: 'WORK_STATISTICS',
      name: 'Work statistics',
      img: 'assets/images/widgets/widget-work-stats.png'
    }, {
      code: 'WORKLOAD',
      name: 'Workload by completition status',
      img: 'assets/images/widgets/widget-workload.png'
    }, {
      code: 'VELOCITY',
      name: 'Velocity over time',
      img: 'assets/images/widgets/widget-velocity.png'
    }, {
      code: 'PULSE',
      name: 'Pulse',
      img: 'assets/images/widgets/widget-pulse.png'
    }, {
      code: 'PEOPLE_DIRECTORY',
      name: 'People directory',
      img: 'assets/images/widgets/widget-people.png'
    }, {
      code: 'ORGANIZATIONAL_STRUCTURE',
      name: 'Organizational Structure',
      img: 'assets/images/widgets/widget-organizational.png'
    }, {
      code: 'WORK_STATISTICS_NORTH_STAR',
      name: 'Work statistics North Stars',
      img: 'assets/images/widgets/widget-northstars.png'
    }, {
      code: 'ENGAGEMENT',
      name: 'Engagement',
      img: 'assets/images/widgets/widget-engagement.png'
    }, {
      code: 'KPI_PERFORMANCE',
      name: 'KPI Performance',
      img: 'assets/images/widgets/widget-kpi.png'
    }
  ];

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private groupService: GroupService,
    private userService: UserService,
    public utilityService: UtilityService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private mdDialogRef: MatDialogRef<WidgetSelectorDialogComponent>,
    private injector: Injector
  ) {
    this.groupId = this.data.groupId;
    this.groupProjectType = this.data.groupProjectType;
    this.userId = this.data.userId;
    this.selectedWidgets = this.data.selectedWidgets || [];
    this.initSelectedWidgets = [...this.selectedWidgets];
    this.groupEnableAllocation = this.data.groupEnableAllocation;
    this.resource_management_allocation = this.data.resource_management_allocation || false;
  }

  async ngOnInit() {

    if (this.groupId) {
      this.availableWidgets = this.groupAvailableWidgets;
      if (this.groupProjectType) {
        this.availableWidgets.push({
          code: 'KPI_PERFORMANCE',
          name: 'KPI Performance',
          img: 'assets/images/widgets/widget-kpi.png'
        });
      }
    }

    if (this.userId) {
      this.availableWidgets = this.globalAvailableWidgets;
    }
  }


  cancel() {
    this.selectedWidgets = [...this.initSelectedWidgets];
    this.newSelectedWidgets = [];
    this.cancelEvent.emit(this.initSelectedWidgets);

    // Close the modal
    this.mdDialogRef.close();
  }

  isSelected(widgetCode) {
    return this.selectedWidgets.indexOf(widgetCode) >= 0 || this.newSelectedWidgets.indexOf(widgetCode) >= 0;
  }

  selectWidget(widget) {
    const selectedWidgetIndex = this.selectedWidgets.indexOf(widget.code);
    const newSelectedWidgetIndex = this.newSelectedWidgets.indexOf(widget.code);

    if (selectedWidgetIndex >= 0 || newSelectedWidgetIndex >= 0) {
      if (selectedWidgetIndex >= 0) {
        this.selectedWidgets.splice(selectedWidgetIndex, 1);
      }
      if (newSelectedWidgetIndex >= 0) {
        this.newSelectedWidgets.splice(newSelectedWidgetIndex, 1);
      }
    } else {
      this.newSelectedWidgets.push(widget.code);
    }
  }

  enableDisplayAllocation(selected) {
    this.utilityService.asyncNotification('Please wait we are saving the new setting...',
      new Promise((resolve, reject)=>{
        this.groupService.saveSettings(this.groupId, {resource_management_allocation: selected.checked})
          .then(()=> {
            this.enableAllocationEvent.emit(selected.checked);
            resolve(this.utilityService.resolveAsyncPromise('Settings saved to your group!'));
          })
          .catch(() => reject(this.utilityService.rejectAsyncPromise('Unable to save the settings to your group, please try again!')))
      }));
  }

  save() {
    this.selectedWidgets = this.selectedWidgets.concat(this.newSelectedWidgets);

    this.utilityService.asyncNotification('Please wait we are saving the widgets...', new Promise((resolve, reject) => {
      if (this.groupId) {
        this.groupService.saveSelectedWidgets(this.groupId, this.selectedWidgets)
          .then((res) => {
            this.publicFunctions.sendUpdatesToGroupData(res['group']);
            this.newSelectedWidgets = [];
            this.saveEvent.emit(this.selectedWidgets);

            // Close the modal
            this.mdDialogRef.close();

            resolve(this.utilityService.resolveAsyncPromise('Group updated!'));
          })
          .catch((err) => {
            reject(this.utilityService.rejectAsyncPromise('Unable to update the group, please try again!'))
          });
      }

      if (this.userId) {
        this.userService.saveSelectedWidgets(this.userId, this.selectedWidgets)
          .then((res) => {
            this.publicFunctions.sendUpdatesToUserData(res['user']);
            this.newSelectedWidgets = [];
            this.saveEvent.emit(this.selectedWidgets);

            // Close the modal
            this.mdDialogRef.close();

            resolve(this.utilityService.resolveAsyncPromise('User updated!'));
          })
          .catch((err) => {
            reject(this.utilityService.rejectAsyncPromise('Unable to update the user, please try again!'))
          });
      }
    }));
  }
}
