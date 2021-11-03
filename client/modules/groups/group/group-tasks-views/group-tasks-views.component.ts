import { Component, OnInit, OnDestroy, Injector } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';
import { PublicFunctions } from 'modules/public.functions';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { UserService } from 'src/shared/services/user-service/user.service';
import moment from 'moment';

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
  sortingData: any;

  currentWorkspace: any;
  isIdeaModuleAvailable = false;
  isShuttleTasksModuleAvailable = false;

  filteringBit:String = 'none'
  filteringData: any;
  // Fetch groupId from router snapshot
  groupId = this.router.snapshot.queryParamMap.get('group');

  unchangedColumns: any;

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

    this.isIdeaModuleAvailable = await this.publicFunctions.checkIdeaStatus(this.currentWorkspace?._id, this.currentWorkspace?.management_private_api_key);
    this.isShuttleTasksModuleAvailable = await this.publicFunctions.isShuttleTasksModuleAvailable();

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
    if (this.columns) {
      if (this.groupData.enabled_rights) {
        await this.filterRAGSections();
      } else {
        this.columns.forEach(column => {
          column.canEdit = true;
        });
      }

      this.columns?.forEach((column: any) => {
        column.tasks = []
      });
    }

    // Fetch all the tasks posts from the server
    this.tasks = await this.publicFunctions.getPosts(this.groupId, 'task');

    if (this.groupData.shuttle_type && this.isShuttleTasksModuleAvailable) {
      const shuttleTasks = await this.publicFunctions.getShuttleTasks(this.groupId);
      this.tasks = this.tasks.concat(shuttleTasks);
    }

    /**
     * Sort the tasks into their respective columns
     */
    await this.sortTasksInColumns(this.columns, this.tasks);

    if (this.groupData?.enabled_rights) {
      await this.filterRAGTasks();
    }

    let col = [];
    if (this.columns) {
      this.columns.forEach(val => col.push(Object.assign({}, val)));
    }
    let unchangedColumns: any = { columns: col };
    this.unchangedColumns = JSON.parse(JSON.stringify(unchangedColumns));

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
      this.utilityService.openCreatePostFullscreenModal(post, this.userData, this.groupData, this.isIdeaModuleAvailable, this.columns);
    }
  }

  async onChangeViewEmitter(view: string) {
    // Start the loading spinner
    this.isLoading$.next(true);

    if (view != 'archived') {
      this.userData.stats.lastTaskView = view;
      // User service
      const userService = this.injector.get(UserService);

      // Update user´s last view
      await userService.updateUser(this.userData);
      await this.publicFunctions.sendUpdatesToUserData(this.userData);

      this.viewType = view;

      await this.initView();
    } else {
      this.viewType = view;
    }

    // Return the function via stopping the loader
    return this.isLoading$.next(false);
  }

  async onSortTaskEmitter(sort: any){
    this.sortingBit = sort.bit;
    this.sortingData = sort.data;
  }

  async onFilterTaskEmitter(filter: any){
    this.filteringBit = filter.bit;
    this.filteringData = filter.data;

    this.filtering();
  }

  async onCustomFieldEmitter(customFields) {
    this.customFields = [...customFields];
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
    if (columns) {
      columns.forEach(async (column: any) => {
        // Feed the tasks into that column which has matching property _column with the column title
        column.tasks = await tasks
          .filter((post: any) => ((post.task._column && (post.task._column._id || post.task._column) == column._id)
            || (post.task.shuttle_type && post.task.shuttles
                && post.task.shuttles.findIndex(shuttle => (shuttle._shuttle_section._id || shuttle._shuttle_section) == column._id) >= 0))
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

  filterRAGSections() {
    let columnsTmp = [];
    this.columns.forEach(column => {
        const canEdit = this.utilityService.canUserDoTaskAction(column, this.groupData, this.userData, 'edit');
        let canView = false;

        if (!canEdit) {
          const hide = this.utilityService.canUserDoTaskAction(column, this.groupData, this.userData, 'hide');
          canView = this.utilityService.canUserDoTaskAction(column, this.groupData, this.userData, 'view') || !hide;
        }

        column.canEdit = canEdit;
        if (canEdit || canView) {
          columnsTmp.push(column);
        }
    });
    this.columns = columnsTmp;
  }

  filterRAGTasks() {
    if (this.columns) {
      this.columns.forEach(column => {
        let tasks = [];

        if (column.tasks) {
          // Filtering other tasks
          column.tasks.forEach(async task => {
            if (task?.rags && task?.rags?.length > 0) {
              const canEdit = await this.utilityService.canUserDoTaskAction(task, this.groupData, this.userData, 'edit');
              let canView = false;
              if (!canEdit) {
                const hide = await this.utilityService.canUserDoTaskAction(task, this.groupData, this.userData, 'hide');
                canView = await this.utilityService.canUserDoTaskAction(task, this.groupData, this.userData, 'view') || !hide;
              }

              if (canEdit || canView) {
                task.canView = true;
                tasks.push(task);
              }
            } else {
              task.canView = true;
              tasks.push(task);
            }
          });
        }
        column.tasks = tasks;
      });
    }
  }

  async filtering() {
    if (this.filteringBit == "mytask") {
      let myClonedUnchnaged = Object.assign({}, this.unchangedColumns);
      let tasks = JSON.parse(JSON.stringify(myClonedUnchnaged));
      for (let index = 0; index < tasks.columns.length; index++) {
        this.columns[index].tasks = tasks.columns[index].tasks.filter((task: any) => {
          var bit = false;
          if (task && task._assigned_to) {
            task._assigned_to.forEach(element => {
              if (element._id == this.userData._id) {
                bit = true
              }
            });
          }
          return bit;
        })
      }
      this.unchangedColumns = tasks;
    } else if (this.filteringBit == 'due_before_today'){
      let myClonedUnchnaged = Object.assign({}, this.unchangedColumns);
      let tasks = JSON.parse(JSON.stringify(myClonedUnchnaged));
      for (let index = 0; index < tasks.columns.length; index++) {
        this.columns[index].tasks = tasks.columns[index].tasks.filter((task: any) => (
          (task?.task?.due_to)? moment.utc(task?.task?.due_to).isBefore(moment().add(-1,'days')):false))
      }
      this.unchangedColumns = tasks;
    } else if (this.filteringBit == 'due_today'){
      let myClonedUnchnaged = Object.assign({}, this.unchangedColumns);
      let tasks = JSON.parse(JSON.stringify(myClonedUnchnaged));
      for (let index = 0; index < tasks.columns.length; index++) {
        this.columns[index].tasks = tasks.columns[index].tasks.filter((task: any) => (
          (task?.task?.due_to)? moment.utc(task?.task?.due_to).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD'):false))
      }
      this.unchangedColumns = tasks;
    } else if (this.filteringBit == 'due_today'){
      let myClonedUnchnaged = Object.assign({}, this.unchangedColumns);
      let tasks = JSON.parse(JSON.stringify(myClonedUnchnaged));
      for (let index = 0; index < tasks.columns.length; index++) {
        this.columns[index].tasks = tasks.columns[index].tasks.filter((task: any) => (
          (task?.task?.due_to)? moment.utc(task?.task?.due_to).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD'):false))
      }
      this.unchangedColumns = tasks;
    } else if (this.filteringBit == 'due_tomorrow'){
      let myClonedUnchnaged = Object.assign({}, this.unchangedColumns);
      let tasks = JSON.parse(JSON.stringify(myClonedUnchnaged));
      for (let index = 0; index < tasks.columns.length; index++) {
        this.columns[index].tasks = tasks.columns[index].tasks.filter((task: any) => (
          (task?.task?.due_to)? moment.utc(task?.task?.due_to).format('YYYY-MM-DD') == moment().add(1,'days').format('YYYY-MM-DD'):false))
      }
      this.unchangedColumns = tasks;
    } else if (this.filteringBit == 'due_week'){
      let myClonedUnchnaged = Object.assign({}, this.unchangedColumns);
      let tasks = JSON.parse(JSON.stringify(myClonedUnchnaged));
      for (let index = 0; index < tasks.columns.length; index++) {
        this.columns[index].tasks = tasks.columns[index].tasks.filter((task: any) => {
          const first = moment().startOf('week').format();
          const last = moment().endOf('week').add(1,'days').format();
          if(task?.task?.due_to){
            if((moment.utc(task?.task?.due_to).isAfter(first)) && (moment.utc(task?.task?.due_to).isBefore(last))){
              return true;
            }else{
              return false;
            }
          } else {
            return false;
          }

        })
      }
      this.unchangedColumns = tasks;
    } else if (this.filteringBit == 'due_next_week'){
      let myClonedUnchnaged = Object.assign({}, this.unchangedColumns);
      let tasks = JSON.parse(JSON.stringify(myClonedUnchnaged));
      for (let index = 0; index < tasks.columns.length; index++) {
        this.columns[index].tasks = tasks.columns[index].tasks.filter((task: any) => {
          const first = moment().endOf('week').add(1,'days').format();
          const last = moment().endOf('week').add(9,'days').format();
          if(task?.task?.due_to){
            if((moment.utc(task?.task?.due_to).isAfter(first)) && (moment.utc(task?.task?.due_to).isBefore(last))){
              return true;
            }else{
              return false;
            }
          } else {
            return false;
          }

        })
      }
      this.unchangedColumns = tasks;
    } else if (this.filteringBit == 'due_14_days'){
      let myClonedUnchnaged = Object.assign({}, this.unchangedColumns);
      let tasks = JSON.parse(JSON.stringify(myClonedUnchnaged));
      for (let index = 0; index < tasks.columns.length; index++) {
        this.columns[index].tasks = tasks.columns[index].tasks.filter((task: any) => {
          const first = moment().format();
          const last = moment().add(14,'days').format();
          if(task?.task?.due_to){
            if((moment.utc(task?.task?.due_to).isAfter(first)) && (moment.utc(task?.task?.due_to).isBefore(last))){
              return true;
            }else{
              return false;
            }
          } else {
            return false;
          }

        })
      }
      this.unchangedColumns = tasks;
    } else if (this.filteringBit == "users") {
      let myClonedUnchnaged = Object.assign({}, this.unchangedColumns);
      let tasks = JSON.parse(JSON.stringify(myClonedUnchnaged));
      for (let index = 0; index < tasks.columns.length; index++) {
        this.columns[index].tasks = tasks.columns[index].tasks.filter((task: any) => {
          var bit = false;
          if (task && task._assigned_to) {
            task._assigned_to.forEach(element => {
              if (element._id == this.filteringData) {
                bit = true
              }
            });
          }
          return bit;
        })
      }
      this.unchangedColumns = tasks;
    } else if (this.filteringBit == "custom_field") {
      let myClonedUnchnaged = Object.assign({}, this.unchangedColumns);
      let tasks = JSON.parse(JSON.stringify(myClonedUnchnaged));
      const cfName = this.filteringData.name;
      const cfValue = this.filteringData.value;
      for (let index = 0; index < tasks.columns.length; index++) {
        this.columns[index].tasks = tasks.columns[index].tasks.filter((task: any) => {
          return (task.task.custom_fields && task.task.custom_fields[cfName] == cfValue);
        });
      }
      this.unchangedColumns = tasks;
    } else if (this.filteringBit == "ideas") {
      let myClonedUnchnaged = Object.assign({}, this.unchangedColumns);
      let tasks = JSON.parse(JSON.stringify(myClonedUnchnaged));
      for (let index = 0; index < tasks.columns.length; index++) {
        this.columns[index].tasks = tasks.columns[index].tasks.filter((task: any) => (
          task.task.is_idea == true));
      }
      this.unchangedColumns = tasks;
    } else {
      this.columns = this.unchangedColumns.columns;
    }
  }
}
