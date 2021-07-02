import { Component, OnInit, OnDestroy, Injector } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';
import { PublicFunctions } from 'modules/public.functions';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { UserService } from 'src/shared/services/user-service/user.service';

@Component({
  selector: 'app-group-tasks-views',
  templateUrl: './group-tasks-views.component.html',
  styleUrls: ['./group-tasks-views.component.scss']
})
export class GroupTasksViewsComponent implements OnInit, OnDestroy {

  viewType = 'kanban';

  // GroupData
  groupData: any;
  columns: any = [];
  tasks: any = [];
  userData: any;
  customFields: any = [];
  sortingBit:String = 'none';
  currentWorkspace: any;
  ideaModuleAvailable = false;

  filteringBit:String = 'none'
  filteringData:String = ''
  // Fetch groupId from router snapshot
  groupId = this.router.snapshot.queryParamMap.get('group');

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  // Subsink Object
  subSink = new SubSink();

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private router: ActivatedRoute,
    public utilityService: UtilityService,
    private groupService: GroupService,
    private _router: Router,
    private injector: Injector) { }


  async ngOnInit() {
    // Start the loading spinner
    this.isLoading$.next(true);

    await this.initView();

    // Return the function via stopping the loader
    return this.isLoading$.next(false);
  }

  /**
   * Unsubscribe all the observables to avoid memory leaks
   */
  ngOnDestroy() {
    this.subSink.unsubscribe();
    this.isLoading$.complete();
  }

  async onChangeViewEmitter(view: string) {
    // Start the loading spinner
    this.isLoading$.next(true);

    this.userData.stats.lastTaskView = view;
    // User service
    const userService = this.injector.get(UserService);

    // Update user´s last view
    await userService.updateUser(this.userData);
    await this.publicFunctions.sendUpdatesToUserData(this.userData);

    this.viewType = view;

    await this.initView();

    // Return the function via stopping the loader
    return this.isLoading$.next(false);
  }

  async onSortTaskEmitter(bit:string){
    this.sortingBit = bit;
  }

  async onFilterTaskEmitter(obj:any){
    // let task = this.columns;
    if(obj.bit){
      this.filteringBit = obj.bit;
    }
    if(obj.data){
      this.filteringData=obj.data
    }

  }

  async onCustomFieldEmitter(customFields) {
    this.customFields = [...customFields];
  }

  async initView() {

    // Fetch current user details
    this.userData = await this.publicFunctions.getCurrentUser();

    // Fetch current group from the service
    await this.subSink.add(this.utilityService.currentGroupData.subscribe(async (res) => {
      if (JSON.stringify(res) !== JSON.stringify({})) {
        // Assign the GroupData
        this.groupData = res;
      }
    }));

    this.currentWorkspace = await this.publicFunctions.getCurrentWorkspace();

    this.ideaModuleAvailable = await this.publicFunctions.checkIdeaStatus(this.currentWorkspace?._id, this.currentWorkspace?.management_private_api_key);

    // Set the initial view
    if (this.userData && this.userData.stats && this.userData.stats.lastTaskView) {
      this.viewType = this.userData.stats.lastTaskView;

      if (this.viewType === 'gantt' && (this.groupData && !this.groupData.project_type)) {
        this.viewType = 'kanban';
      }
    }

    /**
     * Here we fetch all the columns available in a group, and if null we initialise them with the default one
     */
    this.columns = await this.publicFunctions.getAllColumns(this.groupId);

    /**
     * Adding the property of tasks in every column
     */
    this.columns?.forEach((column: any) => {
      column.tasks = []
    });

    // Fetch all the tasks posts from the server
    this.tasks = await this.publicFunctions.getPosts(this.groupId, 'task');

    if (this.groupData.shuttle_type) {
      const shuttleTasks = await this.publicFunctions.getShuttleTasks(this.groupId);
      this.tasks = this.tasks.concat(shuttleTasks);
    }

    /**
     * Sort the tasks into their respective columns
     */
    await this.sortTasksInColumns(this.columns, this.tasks);

    if (this.groupData.enabled_rights) {
      this.initSections();
    }

    /**
     * Obtain the custom fields
     */
    this.customFields = [];
    await this.groupService.getGroupCustomFields(this.groupId).then((res) => {
      if (res['group']['custom_fields']) {
        res['group']['custom_fields'].forEach(field => {
          this.customFields.push(field);
        });
      }
    });

    if (this._router.routerState.snapshot.root.queryParamMap.has('postId')) {
      const postId = this._router.routerState.snapshot.root.queryParamMap.get('postId');
      const post = await this.publicFunctions.getPost(postId);
      this.utilityService.openCreatePostFullscreenModal(post, this.userData, this.groupId, this.ideaModuleAvailable, this.columns);
    }
  }

  isAdminUser() {
    const index = this.groupData._admins.findIndex((admin: any) => admin._id === this.userData._id);
    return index >= 0;
  }

  /**
   * This Function is responsible for sorting the tasks into columns
   * @param columns
   * @param tasks
   */
  sortTasksInColumns(columns: any, tasks: any) {
    columns.forEach(async (column: any) => {
      // Feed the tasks into that column which has matching property _column with the column title
      column.tasks = await tasks
        .filter((post: any) => ((post.task.hasOwnProperty('_column') === true
            && post.task._column
            && (post.task._column._id || post.task._column) == column['_id'])
          || post.task._shuttle_section == column['_id'])
        )
        .sort(function(t1, t2) {
          if (t1.task.status != t2.task.status) {
            return t1.task.status == 'done' ? 1 : -1;
          }
          return t2.title - t1.title;
        });

      // Find the hightes due date on the tasks of the column
      column.real_due_date = this.publicFunctions.getHighestDate(column.tasks);

      // Calculate number of done tasks
      column.numDoneTasks = column.tasks.filter((post) => post?.task?.status?.toLowerCase() == 'done').length;
    });
  }


  async onTaskClonned(data) {
    // Start the loading spinner
    this.isLoading$.next(true);

    await this.initView();

    // Return the function via stopping the loader
    return this.isLoading$.next(false);
  }

  newSectionAdded(data) {

    // Push the Column
    this.columns.push(data);
  }

  initSections() {
    this.columns.forEach(column => {
      let tasks = [];

      // Filtering other tasks
      column.tasks.forEach(task => {
        if (task.bars !== undefined && task.bars.length > 0) {
          task.bars.forEach(bar => {
            if (bar.tag_members.includes(this.userData._id) || this.userData.role !== "member") {
              tasks.push(task);
            }
          });
        } else {
          tasks.push(task);
        }
      });
      column.tasks = tasks;
    });
  }
}
