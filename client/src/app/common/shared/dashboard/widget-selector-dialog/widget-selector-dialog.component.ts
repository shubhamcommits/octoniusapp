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

  groupId;
  userId;

  selectedWidgets = [];
  newSelectedWidgets = [];

  availableWidgets= [];

  groupAvailableWidgets = [
    {
      code: 'WORK_STATISTICS',
      name: 'Work statistics'
    }, {
      code: 'WORKLOAD',
      name: 'Workload by completition status'
    }, {
      code: 'VELOCITY',
      name: 'Velocity over time'
    }, {
      code: 'ENGAGEMENT',
      name: 'Engagement'
    }, {
      code: 'KPI_PERFORMANCE',
      name: 'KPI Performance'
    }, {
      code: 'RESOURCE_MANAGEMENT',
      name: 'Resource management'
    }
  ];

  globalAvailableWidgets = [
    {
      code: 'WORK_STATISTICS',
      name: 'Work statistics'
    }, {
      code: 'WORKLOAD',
      name: 'Workload by completition status'
    }, {
      code: 'VELOCITY',
      name: 'Velocity over time'
    }, {
      code: 'PULSE',
      name: 'Pulse'
    }, {
      code: 'PEOPLE_DIRECTORY',
      name: 'People directory'
    }, {
      code: 'ORGANIZATIONAL_STRUCTURE',
      name: 'Organizational Structure'
    }, {
      code: 'WORK_STATISTICS_NORTH_STAR',
      name: 'Work statistics North Stars'
    }, {
      code: 'ENGAGEMENT',
      name: 'Engagement'
    }, {
      code: 'KPI_PERFORMANCE',
      name: 'KPI Performance'
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
    this.userId = this.data.userId;
    this.selectedWidgets = this.data.selectedWidgets || [];
  }

  async ngOnInit() {

    if (this.groupId) {
      this.availableWidgets = this.groupAvailableWidgets;
    }

    if (this.userId) {
      this.availableWidgets = this.globalAvailableWidgets;
    }
  }


  cancel() {
    this.selectedWidgets = this.data.selectedWidgets || [];
    this.newSelectedWidgets = [];

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

  save() {
    this.selectedWidgets = this.selectedWidgets.concat(this.newSelectedWidgets);

    this.utilityService.asyncNotification('Please wait we are saving the widgets...', new Promise((resolve, reject) => {
      if (this.groupId) {
        this.groupService.saveSelectedWidgets(this.groupId, this.selectedWidgets)
          .then((res) => {
            this.selectedWidgets = res['group'].selected_widgets || [];
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
            this.selectedWidgets = res['user'].selected_widgets || [];
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
