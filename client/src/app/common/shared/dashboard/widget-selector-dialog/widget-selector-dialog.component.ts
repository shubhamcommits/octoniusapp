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
  custom_fields = [];

  selectedWidgets = [];
  newSelectedWidgets = [];
  initSelectedWidgets = [];
  groupEnableAllocation = false;
  resource_management_allocation = false;

  availableWidgets= [];

  groupAvailableWidgets = [
    {
      code: 'WORK_STATISTICS',
      name: $localize`:@@widgetSelectorDialog.workStatistics:Work statistics`,
      img: 'assets/images/widgets/widget-work-stats.png'
    }, {
      code: 'WORKLOAD',
      name: $localize`:@@widgetSelectorDialog.workloadCompletitionStatus:Workload by completition status`,
      img: 'assets/images/widgets/widget-workload.png'
    }, {
      code: 'VELOCITY',
      name: $localize`:@@widgetSelectorDialog.velocityOverTime:Velocity over time`,
      img: 'assets/images/widgets/widget-velocity.png'
    }, {
      code: 'ENGAGEMENT',
      name: $localize`:@@widgetSelectorDialog.engagement:Engagement`,
      img: 'assets/images/widgets/widget-engagement.png'
    }, {
      code: 'RESOURCE_MANAGEMENT',
      name: $localize`:@@widgetSelectorDialog.resourceManagement:Resource management`,
      img: 'assets/images/widgets/widget-resources.png'
    }, {
      code: 'CF_TABLE',
      name: $localize`:@@widgetSelectorDialog.cf:Custom Fields Table`,
      img: 'assets/images/widgets/widget-cf-table.svg'
    }
  ];

  globalAvailableWidgets = [
    {
      code: 'WORK_STATISTICS',
      name: $localize`:@@widgetSelectorDialog.workStatistics:Work statistics`,
      img: 'assets/images/widgets/widget-work-stats.png'
    }, {
      code: 'WORKLOAD',
      name: $localize`:@@widgetSelectorDialog.workloadCompletitionStatus:Workload by completition status`,
      img: 'assets/images/widgets/widget-workload.png'
    }, {
      code: 'VELOCITY',
      name: $localize`:@@widgetSelectorDialog.velocityOverTime:Velocity over time`,
      img: 'assets/images/widgets/widget-velocity.png'
    }, {
      code: 'PULSE',
      name: $localize`:@@widgetSelectorDialog.pulse:Pulse`,
      img: 'assets/images/widgets/widget-pulse.png'
    }, {
      code: 'PEOPLE_DIRECTORY',
      name: $localize`:@@widgetSelectorDialog.peopleDirectory:People directory`,
      img: 'assets/images/widgets/widget-people.png'
    }, {
      code: 'ORGANIZATIONAL_STRUCTURE',
      name: $localize`:@@widgetSelectorDialog.organizationalStructure:Organizational Structure`,
      img: 'assets/images/widgets/widget-organizational.png'
    }, {
      code: 'WORK_STATISTICS_NORTH_STAR',
      name: $localize`:@@widgetSelectorDialog.workStatisticsNorthStars:Work statistics North Stars`,
      img: 'assets/images/widgets/widget-northstars.png'
    }, {
      code: 'ENGAGEMENT',
      name: $localize`:@@widgetSelectorDialog.engagement:Engagement`,
      img: 'assets/images/widgets/widget-engagement.png'
    }, {
      code: 'KPI_PERFORMANCE',
      name: $localize`:@@widgetSelectorDialog.kpiPerformance:KPI Performance`,
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
    this.custom_fields = (this.data.custom_fields) ? this.data.custom_fields.filter(cf => cf.input_type) || [] : [];
  }

  async ngOnInit() {

    if (this.groupId) {
      this.availableWidgets = this.groupAvailableWidgets;
      if (this.groupProjectType) {
        this.availableWidgets.push({
          code: 'KPI_PERFORMANCE',
          name: $localize`:@@widgetSelectorDialog.kpiPerformance:KPI Performance`,
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

  selectWidget(widget: any, cfName?: string) {
    const widgetCode = (cfName) ? cfName : widget.code;

    const selectedWidgetIndex = this.selectedWidgets.indexOf(widgetCode);
    const newSelectedWidgetIndex = this.newSelectedWidgets.indexOf(widgetCode);

    if (selectedWidgetIndex >= 0 || newSelectedWidgetIndex >= 0) {
      if (selectedWidgetIndex >= 0) {
        this.selectedWidgets.splice(selectedWidgetIndex, 1);
      }
      if (newSelectedWidgetIndex >= 0) {
        this.newSelectedWidgets.splice(newSelectedWidgetIndex, 1);
      }
    } else {
      this.newSelectedWidgets.push(widgetCode);
    }
  }

  enableDisplayAllocation(selected) {
    this.utilityService.asyncNotification($localize`:@@widgetSelectorDialog.pleaseWaitWeSavingSettings:Please wait we are saving the new setting...`,
      new Promise((resolve, reject)=>{
        this.groupService.saveSettings(this.groupId, {resource_management_allocation: selected.checked})
          .then(()=> {
            this.enableAllocationEvent.emit(selected.checked);
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@widgetSelectorDialog.settingsSavedGroup:Settings saved to your group!`));
          })
          .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@widgetSelectorDialog.unableToSaveSettings:Unable to save the settings to your group, please try again!`)))
      }));
  }

  save() {
    this.selectedWidgets = this.selectedWidgets.concat(this.newSelectedWidgets);

    this.utilityService.asyncNotification($localize`:@@widgetSelectorDialog.pleaseWaitWeSavingWidgets:Please wait we are saving the widgets...`, new Promise((resolve, reject) => {
      if (this.groupId) {
        this.groupService.saveSelectedWidgets(this.groupId, this.selectedWidgets)
          .then((res) => {
            this.publicFunctions.sendUpdatesToGroupData(res['group']);
            this.newSelectedWidgets = [];
            this.saveEvent.emit(this.selectedWidgets);

            // Close the modal
            this.mdDialogRef.close();

            resolve(this.utilityService.resolveAsyncPromise($localize`:@@widgetSelectorDialog.groupUpdated:Group updated!`));
          })
          .catch((err) => {
            reject(this.utilityService.rejectAsyncPromise($localize`:@@widgetSelectorDialog.unableToUpdateGroup:Unable to update the group, please try again!`))
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

            resolve(this.utilityService.resolveAsyncPromise($localize`:@@widgetSelectorDialog.userUpdated:User updated!`));
          })
          .catch((err) => {
            reject(this.utilityService.rejectAsyncPromise($localize`:@@widgetSelectorDialog.unableToUpdateUser:Unable to update the user, please try again!`))
          });
      }
    }));
  }
}
