import { Component, OnInit, OnDestroy, Injector } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';
import { ColumnService } from 'src/shared/services/column-service/column.service';
import { PublicFunctions } from 'src/app/dashboard/public.functions';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { PostService } from 'src/shared/services/post-service/post.service';

@Component({
  selector: 'app-group-tasks-views',
  templateUrl: './group-tasks-views.component.html',
  styleUrls: ['./group-tasks-views.component.scss']
})
export class GroupTasksViewsComponent implements OnInit, OnDestroy {

  viewType = 'list';

  // GroupData
  groupData: any;
  columns: any = [];
  tasks: any = [];
  userData: any;
  customFields: any = [];

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
    private injector: Injector,
    private postService: PostService) { }


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
      this.viewType = view;
      this.initView();
  }

  async onCustomFieldEmitter() {
    if (this.viewType === 'list') {
      this.initView();
    }
  }

  async initView() {
    // Fetch current group from the service
    this.subSink.add(this.utilityService.currentGroupData.subscribe(async (res) => {
      if (JSON.stringify(res) !== JSON.stringify({})) {

        // Assign the GroupData
        this.groupData = res;
      }
    }));

    // Fetch current user details
    this.userData = await this.publicFunctions.getCurrentUser();

    /**
     * Here we fetch all the columns available in a group, and if null we initialise them with the default one
     */
    this.columns = await this.publicFunctions.getAllColumns(this.groupId);
    if (this.columns == null) {
      this.columns = await this.initialiseColumns(this.groupId);
    }

    /**
     * Adding the property of tasks in every column
     */
    this.columns.forEach((column: any) => {
      column.tasks = []
    });

    // Fetch all the tasks posts from the server
    this.tasks = await this.publicFunctions.getPosts(this.groupId, 'task');

    /**
     * Sort the tasks into their respective columns
     */
    this.sortTasksInColumns(this.columns, this.tasks);

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
      this.utilityService.openCreatePostFullscreenModal(post, this.userData, this.groupId);
    }
  }

  /**
   * This function initialises the default column - todo
   * @param groupId
   */
  async initialiseColumns(groupId: string) {

    // Column Service Instance
    const columnService = this.injector.get(ColumnService);

    // Call the HTTP Put request
    return new Promise((resolve, reject) => {
      columnService.initColumns(groupId)
        .then((res) => {
          resolve(res['columns']);
        })
        .catch((err) => {
          this.utilityService.errorNotification('Unable to initialize the columns, please try again later!');
          reject({});
        });
    });
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

    columns.forEach((column: any) => {
      // Feed the tasks into that column which has matching property _column with the column title
      column.tasks = tasks
        .filter((post: any) => post.task.hasOwnProperty(
          '_column') === true &&
          post.task._column != null && post.task._column.title === column['title'] && post.task.status !== 'done'
        );

      column.tasks.done = tasks
        .filter((post: any) => post.task.hasOwnProperty(
          '_column') === true &&
          post.task._column != null && post.task._column.title === column['title'] && post.task.status === 'done'
        );
    });
  }
}
