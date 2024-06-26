import { Component, OnInit, OnDestroy, Injector, AfterContentChecked } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';
import { PublicFunctions } from 'modules/public.functions';
import { Router } from '@angular/router';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { UserService } from 'src/shared/services/user-service/user.service';
import { DateTime } from 'luxon';
import { ColumnService } from 'src/shared/services/column-service/column.service';
import { PostService } from 'src/shared/services/post-service/post.service';

@Component({
  selector: 'app-group-tasks-views',
  templateUrl: './group-tasks-views.component.html',
  styleUrls: ['./group-tasks-views.component.scss']
})
export class GroupTasksViewsComponent implements OnInit, OnDestroy, AfterContentChecked {

  viewType = 'kanban';

  sections: any = [];
  groupData: any;
  userData: any;
  workspaceData: any;
  customFields: any = [];

  tasks: any = [];

  isAdmin = false;

  sortingBit:String = 'none';
  sortingData: any;

  filteringBit:String = 'none'
  filteringData: any;
  filterStartDate;
  filterEndDate;
  
  // unchangedColumns: any;

  isIdeaModuleAvailable = false;
  isShuttleTasksModuleAvailable = false;

  exportData = false;

  // IsLoading behaviou subject maintains the state for loading spinner
  isLoading$;

  // Subsink Object
  subSink = new SubSink();

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public utilityService: UtilityService,
    private groupService: GroupService,
    private columnService: ColumnService,
    private postService: PostService,
    private _router: Router,
    private injector: Injector) { }


  async ngOnInit() {
    // Start the loading spinner
    this.utilityService.updateIsLoadingSpinnerSource(true);

    await this.initView();

    // Return the function via stopping the loader
    //this.utilityService.updateIsLoadingSpinnerSource(false);
  }

  ngAfterContentChecked() {
    this.subSink.add(this.utilityService.isLoadingSpinner.subscribe((res) => {
      this.isLoading$ = res;
    }));
  }

  /**
   * Unsubscribe all the observables to avoid memory leaks
   */
  ngOnDestroy() {
    this.subSink.unsubscribe();
  }

  async initView(view?: string) {
    // Fetch current user details
    if (!this.utilityService.objectExists(this.userData)) {
      this.userData = await this.publicFunctions.getCurrentUser();
    }

    if (!this.utilityService.objectExists(this.groupData)) {
      this.groupData = await this.publicFunctions.getCurrentGroupDetails();
    }

    // Set the initial view
    if (!!view) {
      this.viewType = view;
    } else {
      if (!!this.userData && !!this.userData.stats && !!this.userData.stats.lastTaskView && this.viewType != 'time_tracking') {
        this.viewType = this.userData.stats.lastTaskView;
        
        if (this.viewType === 'timeline' && (this.groupData && !this.groupData.project_type)) {
          this.viewType = 'kanban';
        }
      }
    }

    if (this.viewType != 'time_tracking') {
      await this.initTaskView();
    }

    this.utilityService.updateIsLoadingSpinnerSource(false);
  }

  async initTaskView() {
    if (this._router.routerState.snapshot.root.queryParamMap.has('postId')) {
      const postId = this._router.routerState.snapshot.root.queryParamMap.get('postId');

      let post: any = await this.publicFunctions.getPost(postId);

      let canOpen = true;
      if (this.groupData?.enabled_rights) {
        const canEdit = await this.utilityService.canUserDoTaskAction(post, this.groupData, this.userData, 'edit');
        let canView = false;
        if (!canEdit) {
          const hide = await this.utilityService.canUserDoTaskAction(post, this.groupData, this.userData, 'hide');
          canView = await this.utilityService.canUserDoTaskAction(post, this.groupData, this.userData, 'view') || !hide;
        }
        canOpen = canView || canEdit;
      }

      if (canOpen) {
        this.sections = await this.publicFunctions.getAllColumns(this.groupData?._id);
      }

      this.utilityService.openPostDetailsFullscreenModal(postId, this.groupData._id, canOpen, this.sections);

      this.utilityService.updateIsLoadingSpinnerSource(false);
    }

    this.groupData = await this.publicFunctions.getCurrentGroupDetails();

    this.isAdmin = this.isAdminUser();

    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    this.isIdeaModuleAvailable = await this.publicFunctions.checkIdeaStatus(this.workspaceData?._id, this.workspaceData?.management_private_api_key);
    this.isShuttleTasksModuleAvailable = await this.publicFunctions.isShuttleTasksModuleAvailable();

    /**
     * Obtain the custom fields
     */
    this.customFields = [];
    await this.groupService.getGroupCustomFields(this.groupData?._id).then((res) => {
      if (!!res['group']['custom_fields']) {
        res['group']['custom_fields'].forEach(field => {
          if (!field.input_type) {
            field.values.sort((v1, v2) => (v1 > v2) ? 1 : -1);
          }
          this.customFields.push(field);
        });
      }
    });

    /**
     * Here we fetch all the columns available in a group, and if null we initialise them with the default one
     */
    this.sections = await this.publicFunctions.getAllColumns(this.groupData?._id);

    /**
     * Adding the property of tasks in every column
     */
    if (!!this.sections) {
      if (this.groupData?.enabled_rights) {
        await this.filterRAGSections();
      } else {
        this.sections?.forEach(column => {
          column.canEdit = true;
        });
      }
    }

    // Add TT cost in column budget
    await this.getTimeTrackingCost(this.sections);
  }

  getTimeTrackingCost(sections: any) {
    if (!!sections) {
      sections.forEach(async (section: any) => {
        this.columnService.getSectionTimeTrackingCost(section._id).then(res => {
          section.budget.time_tracking_cost = res['time_tracking_cost'];
        });
      });
    }
  }

  filterRAGSections() {
    let columnsTmp = [];
    this.sections.forEach(async column => {
        const canEdit = await this.utilityService.canUserDoTaskAction(column, this.groupData, this.userData, 'edit');
        let canView = false;

        if (!canEdit) {
          const hide = await this.utilityService.canUserDoTaskAction(column, this.groupData, this.userData, 'hide');
          canView = await this.utilityService.canUserDoTaskAction(column, this.groupData, this.userData, 'view') || !hide;
        }

        column.canEdit = canEdit;
        if (canEdit || canView) {
          columnsTmp.push(column);
        }
    });
    this.sections = columnsTmp;
  }

  async onChangeViewEmitter(view: string) {
    // Start the loading spinner
    this.utilityService.updateIsLoadingSpinnerSource(true);

    this.viewType = view;

    if (view != 'archived' && view != 'time_tracking' && view != 'resource_mgmt' && this.userData.stats.lastTaskView != view) {
    // if (view != 'archived') {
      this.userData.stats.lastTaskView = view;
      // User service
      const userService = this.injector.get(UserService);

      // Update user´s last view
      await userService.updateUser(this.userData);
      await this.publicFunctions.sendUpdatesToUserData(this.userData);
    }
    
    if (view != 'archived') {
      await this.initView(view);
    }

    // Return the function via stopping the loader
    return this.utilityService.updateIsLoadingSpinnerSource(false);
  }

  async onSortTaskEmitter(sort: any){
    this.sortingBit = sort.bit;
    this.sortingData = sort.data;
  }

  async onFilterTaskEmitter(filter: any) {
    this.filteringBit = filter.bit;
    this.filteringData = filter.data;

    if (this.viewType == 'time_tracking') {
      if (!!this.filteringData.startDate) {
        this.filterStartDate = DateTime.fromJSDate(this.filteringData.startDate);
      }

      if (!!this.filteringData.endDate) {
        this.filterEndDate = DateTime.fromJSDate(this.filteringData.endDate);
      }
    }
  }

  async onCustomFieldEmitter(customFields) {
    this.customFields = [...customFields];
    this.groupData = await this.publicFunctions.getCurrentGroupDetails();
  }

  async onExportToEmitter(exportType: any) {
    if (this.viewType !== 'time_tracking') {
      await this.postService.exportTasksTo(exportType, this.sections, this.groupData, this.userData, this.isIdeaModuleAvailable);

      this.utilityService.updateIsLoadingSpinnerSource(false);
    } else {
      this.exportData = !this.exportData;
    }
  }

  isAdminUser() {
    const index = this.groupData._admins.findIndex((admin: any) => admin._id === this.userData._id);
    return index >= 0;
  }
}
