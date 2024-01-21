import { Component, OnInit, Input, Output, EventEmitter, Injector } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { AutomationFlowsDialogComponent } from '../../automation-flows-dialog/automation-flows-dialog.component';
import { CustomFieldsDialogComponent } from '../../custom-fields-dialog/custom-fields-dialog.component';
import { AdvancedFilterDialogComponent } from './advanced-filter-dialog/advanced-filter-dialog.component';
import { ManagementPortalService } from 'src/shared/services/management-portal-service/management-portal.service';
import { TimeTrackerDatesFilterDialogComponent } from './time-tracker-dates-filter-dialog/time-tracker-dates-filter-dialog.component';

@Component({
  selector: 'app-board-bar',
  templateUrl: './board-bar.component.html',
  styleUrls: ['./board-bar.component.scss']
})
export class BoardBarComponent implements OnInit {

  // GroupData Variable
  @Input() groupData: any;
  @Input() sections = [];
  @Input() isAdmin = false;
  @Input() customFields = [];
  @Input() userData;
  @Input() viewType;
  @Input() isIdeaModuleAvailable;

  // Emitter to notify that the view is changing
  @Output() changeViewEmitter: EventEmitter<string> = new EventEmitter<string>();

  // Emitter to notify that the sorting type is changing
  @Output() sortTaskEmitter: EventEmitter<Object> = new EventEmitter<Object>();

  // Emitter to notify that the filter type is changing
  @Output() filterTaskEmitter: EventEmitter<Object> = new EventEmitter<Object>();

  // Emitter to notify that a customField was edited/added
  @Output() customFieldEmitter = new EventEmitter();

  // Emitter to export the tasks
  @Output() exportToEmitter = new EventEmitter();

  public publicFunctions = new PublicFunctions(this.injector);

  sortby: string = 'none'
  filterfor: string = 'none'
  menuLable: string = $localize`:@@boardBar.filterTaskFor:Filter Task For`;
  menuFor: string = 'Filter';
  reverse: boolean = false;
  cfFilter: any = {};
  cfSort: any = {};

  groupMembers:any = [];
  shuttleGroups:any = [];

  isIndividualSubscription = true;

  constructor(
    private utilityService: UtilityService,
    private managementPortalService: ManagementPortalService,
    public dialog: MatDialog,
    private injector: Injector
  ) { }

  async ngOnInit() {
    this.groupMembers = await this.publicFunctions.getCurrentGroupMembers();
    this.shuttleGroups = await this.publicFunctions.getShuttleGroups(this.groupData?._workspace, this.groupData?._id);
    this.isIndividualSubscription = await this.managementPortalService.checkIsIndividualSubscription();
  }

  changeView(view: string) {
    this.changeViewEmitter.emit(view);
  }

  sortTasks(bit: string, cf?: any) {
    this.utilityService.updateIsLoadingSpinnerSource(true);

    if (bit == this.sortby) {
      if (cf && this.cfSort && cf.title != this.cfSort.title) {
        this.reverse = false;
        this.cfSort = (cf) ? cf : {};
        const obj = { bit: bit, data: this.cfSort || '' }
        this.sortTaskEmitter.emit(obj);
      } else {
        if (this.reverse == false) {
          this.reverse = true;
          const obj = { bit: 'reverse' }
          this.sortTaskEmitter.emit(obj);
        } else if (this.reverse == true) {
          this.reverse = false;
          const obj = { bit: 'inverse' }
          this.sortTaskEmitter.emit(obj);
        }
      }
    } else {
      this.sortby = bit;
      this.reverse = false;
      this.cfSort = (cf) ? cf : {};
      const obj = { bit: bit, data: this.cfSort || '' }
      this.sortTaskEmitter.emit(obj);
    }
  }

  filterTask(bit: string, cf?: any) {
    this.utilityService.updateIsLoadingSpinnerSource(true);

    this.filterfor = bit;
    this.cfFilter = (cf) ? cf : {};
    const obj = { bit: bit, data: this.cfFilter || '' }
    this.filterTaskEmitter.emit(obj);
  }

  async onUserSelctionEmitter(userId:string){
    this.filterfor='users';
    const obj={ bit: 'users', data: userId }
    this.filterTaskEmitter.emit(obj);
  }

  openCustomFieldsDialog(): void {
    const dialogRef = this.dialog.open(CustomFieldsDialogComponent, {
      width: '100%',
      height: '100%',
      disableClose: true,
      data: { groupData: this.groupData, workspaceId: this.groupData._workspace }
    });
    const sub = dialogRef.componentInstance.customFieldsEvent.subscribe((data) => {
      this.customFieldEmitter.emit(data);
    });
    dialogRef.afterClosed().subscribe(result => {
      sub.unsubscribe();
    });
  }

  openAutomatorDialog() {
    const dialogRef = this.dialog.open(AutomationFlowsDialogComponent, {
      width: '100%',
      height: '100%',
      disableClose: true,
      data: {
        groupId: this.groupData._id,
        groupSections: this.sections,
        customFields: this.customFields,
        shuttleGroups: this.shuttleGroups
      }
    });
  }

  openAdvancedFilterDialog() {
    const dialogRef = this.dialog.open(AdvancedFilterDialogComponent, {
      width: '50%',
      height: '75%',
      disableClose: true,
      hasBackdrop: true,
      data: { groupData: this.groupData, cf: this.cfFilter }
    });
    const sub = dialogRef.componentInstance.customFieldEvent.subscribe((data) => {
      if (data.name != '' && data.valu != '') {
        this.filterTask('custom_field', data);
      } else {
        this.filterTask('none');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      sub.unsubscribe();
    });
  }

  openTimeTrackerDatesFilterDialog() {
    const data = {
    };

    const dialogRef = this.dialog.open(TimeTrackerDatesFilterDialogComponent, {
      data: data,
      hasBackdrop: true
    });
    const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe((data) => {
      this.filterTask('time_tracking', data);
    });

    dialogRef.afterClosed().subscribe(result => {
      closeEventSubs.unsubscribe();
    });
  }

  exportTo(exportType: string) {
    this.utilityService.updateIsLoadingSpinnerSource(true);

    this.exportToEmitter.emit(exportType);
  }
}
