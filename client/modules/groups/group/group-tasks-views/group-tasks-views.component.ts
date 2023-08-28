import { Component, OnInit, OnDestroy, Injector, AfterContentChecked } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';
import { PublicFunctions } from 'modules/public.functions';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { UserService } from 'src/shared/services/user-service/user.service';
import moment from 'moment';
import * as XLSX from 'xlsx';
import * as fileSaver from 'file-saver';

@Component({
  selector: 'app-group-tasks-views',
  templateUrl: './group-tasks-views.component.html',
  styleUrls: ['./group-tasks-views.component.scss']
})
export class GroupTasksViewsComponent implements OnInit, OnDestroy, AfterContentChecked {

  viewType = 'kanban';

  // GroupData
  groupData: any;
  columns: any = [];
  tasks: any = [];
  userData: any;
  customFields: any = [];

  isAdmin = false;

  sortingBit:String = 'none';
  sortingData: any;

  workspaceData: any;
  isIdeaModuleAvailable = false;
  isShuttleTasksModuleAvailable = false;

  filteringBit:String = 'none'
  filteringData: any;

  unchangedColumns: any;

  // IsLoading behaviou subject maintains the state for loading spinner
  isLoading$;

  // Subsink Object
  subSink = new SubSink();

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public utilityService: UtilityService,
    private groupService: GroupService,
    private router: ActivatedRoute,
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

  async initView() {

    // Fetch current user details
    this.userData = await this.publicFunctions.getCurrentUser();

    if (this._router.routerState.snapshot.root.queryParamMap.has('postId')) {
      const postId = this._router.routerState.snapshot.root.queryParamMap.get('postId');

      let post: any = await this.publicFunctions.getPost(postId);

      this.groupData = await this.publicFunctions.getGroupDetails(post?._group?._id || post?._group);
      this.publicFunctions.sendUpdatesToGroupData(this.groupData);

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
        this.columns = await this.publicFunctions.getAllColumns(this.groupData?._id);
      }

      this.utilityService.openPostDetailsFullscreenModal(postId, this.groupData._id, canOpen, this.columns);
    }

    this.groupData = await this.publicFunctions.getCurrentGroupDetails();

    this.isAdmin = this.isAdminUser();

    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    this.isIdeaModuleAvailable = await this.publicFunctions.checkIdeaStatus(this.workspaceData?._id, this.workspaceData?.management_private_api_key);
    this.isShuttleTasksModuleAvailable = await this.publicFunctions.isShuttleTasksModuleAvailable();

    // Set the initial view
    if (this.userData && this.userData.stats && this.userData.stats.lastTaskView) {
      this.viewType = this.userData.stats.lastTaskView;

      if (this.viewType === 'gantt' && (this.groupData && !this.groupData.project_type)) {
        this.viewType = 'kanban';
      }
    }

    /**
     * Obtain the custom fields
     */
    this.customFields = [];
    await this.groupService.getGroupCustomFields(this.groupData?._id).then((res) => {
      if (res['group']['custom_fields']) {
        res['group']['custom_fields'].forEach(field => {
          this.customFields.push(field);
        });
      }
    });

    /**
     * Here we fetch all the columns available in a group, and if null we initialise them with the default one
     */
    this.columns = await this.publicFunctions.getAllColumns(this.groupData?._id);

    /**
     * Adding the property of tasks in every column
     */
    if (this.columns) {
      if (this.groupData?.enabled_rights) {
        await this.filterRAGSections();
      } else {
        this.columns?.forEach(column => {
          column.canEdit = true;
        });
      }

      this.columns?.forEach((column: any) => {
        column.tasks = []
      });
    }

    // Fetch all the tasks posts from the server
    this.tasks = await this.publicFunctions.getPosts(this.groupData?._id, 'task');

    if (this.groupData.shuttle_type && this.isShuttleTasksModuleAvailable) {
      const shuttleTasks = await this.publicFunctions.getShuttleTasks(this.groupData?._id);
      this.tasks = this.tasks.concat(shuttleTasks);
    }

    if (this.groupData?.enabled_rights) {
      await this.filterRAGTasks();
    }

    /**
     * Sort the tasks into their respective columns
     */
    await this.sortTasksInColumns(this.columns, this.tasks);

    let col = [];
    if (this.columns) {
      this.columns.forEach(val => col.push(Object.assign({}, val)));
    }
    let unchangedColumns: any = { columns: col };
    this.unchangedColumns = JSON.parse(JSON.stringify(unchangedColumns));

    this.utilityService.updateIsLoadingSpinnerSource(false);
  }

  async onChangeViewEmitter(view: string) {
    // Start the loading spinner
    this.utilityService.updateIsLoadingSpinnerSource(true);

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
    return this.utilityService.updateIsLoadingSpinnerSource(false);
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
        const highestDate = this.publicFunctions.getHighestDate(column.tasks);
        column.real_due_date = (highestDate) ? highestDate : column?.due_date;

        // Calculate number of done tasks
        column.numDoneTasks = column.tasks.filter((post) => post?.task?.status?.toLowerCase() == 'done').length;
      });
    }
  }

  async onTaskClonned(data) {
    // Start the loading spinner
    this.utilityService.updateIsLoadingSpinnerSource(true);

    await this.initView();

    // Return the function via stopping the loader
    return this.utilityService.updateIsLoadingSpinnerSource(false);
  }

  async newSectionAdded(column: any) {
    const canEdit = await this.utilityService.canUserDoTaskAction(column, this.groupData, this.userData, 'edit');
    let canView = false;

    if (!canEdit) {
      const hide = await this.utilityService.canUserDoTaskAction(column, this.groupData, this.userData, 'hide');
      canView = await this.utilityService.canUserDoTaskAction(column, this.groupData, this.userData, 'view') || !hide;
    }

    column.canEdit = canEdit;
    if (canEdit || canView) {
      // Push the Column
      this.columns.push(column);
    }
  }

  filterRAGSections() {
    let columnsTmp = [];
    this.columns.forEach(async column => {
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
    this.columns = columnsTmp;
  }

  filterRAGTasks() {
    let tasks = [];

    if (this.tasks) {
      // Filtering other tasks
      this.tasks.forEach(async task => {
        if (task?.permissions && task?.permissions?.length > 0) {
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

    this.tasks = tasks;
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

    this.utilityService.updateIsLoadingSpinnerSource(false);
  }

  async onExportToEmitter(exportType: any) {
    let exportTasks = [];
    for (let i = 0; i < this.columns.length; i++) {
      let section = this.columns[i];

      for (let j = 0; j < section.tasks.length; j++) {
        let post = section.tasks[j];

        let task: any = {
          title: post.title || '',
          posted_by: (post && post._posted_by) ? (post?._posted_by?.first_name + ' ' + post?._posted_by?.last_name) : '',
          created_date: (post?.created_date) ? moment.utc(post?.created_date).format("MMM D, YYYY HH:mm") : '',
          tags: post.tags || '',
          status: post.task.status || '',
        };

        if (post.task.start_date) {
          task.due_to = (post.task.start_date) ? moment.utc(post.task.start_date).format("MMM D, YYYY") : '';
        }
        task.due_to = (post.task.due_to) ? moment.utc(post.task.due_to).format("MMM D, YYYY") : '';

        if (post.task._parent_task) {
          task.section = '';
          task.parent_task = post.task._parent_task.title || '';
        } else {
          task.section = section.title || '';
          task.parent_task = '';
        }

        let assignedTo = '';
        if (post._assigned_to && post._assigned_to.length > 0) {
          post._assigned_to.forEach(user => {
            if (user) {
              assignedTo += user?.first_name + ' ' + user?.last_name + '; ';
            }
          });

          task.assigned_to = assignedTo;
        }

        if (this.isIdeaModuleAvailable && post.task.is_idea && post.task.idea) {
          task.idea_positive = post?.task?.idea?.positive_votes?.length || 0;
          task.idea_negative = post?.task?.idea?.negative_votes?.length || 0;
          task.idea_count = task.idea_positive - task.idea_negative;
        }

        if (post.task.isNorthStar && post.task.northStar) {
          task.northStar_targetValue = post.task.northStar.target_value || 0;
          let sum = 0;
          if (post.task.northStar.values) {
            for (let k = 0; k < post.task.northStar.values.length; k++) {
              sum += post.task.northStar.values[k];
            }
          }
          task.northStar_currentValue = sum;
          task.northStar_type = post.task.northStar.type;
        }

        exportTasks.push(task);
      }
    }

    this.groupService.exportTasksToFile(exportType, exportTasks, this.groupData?.group_name + '_tasks');

    this.utilityService.updateIsLoadingSpinnerSource(false);
  }
}
