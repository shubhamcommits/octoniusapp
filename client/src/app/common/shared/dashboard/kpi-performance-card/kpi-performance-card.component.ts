import { Component, Injector, Input, OnChanges, OnInit } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ColumnService } from 'src/shared/services/column-service/column.service';
import { GroupsService } from 'src/shared/services/groups-service/groups.service';
import { PostService } from 'src/shared/services/post-service/post.service';

@Component({
  selector: 'app-kpi-performance-card',
  templateUrl: './kpi-performance-card.component.html',
  styleUrls: ['./kpi-performance-card.component.scss']
})
export class KpiPerformanceCardComponent implements OnChanges {

  @Input() groupId;
  @Input() type; // column or group

  groupName = '';

  // Base URL
  baseUrl = environment.UTILITIES_GROUPS_UPLOADS;

  // Workspace data
  public workspaceData: Object = {};

  // Pulse groups
  public projects: any = [];

  // Pulse total tasks
  public totalTasks = [];

  // Pulse to do tasks
  public toDoTasks = [];

  // Pulse in progress tasks
  public inProgressTasks = [];

  // Pulse done tasks
  public doneTasks = [];

  // Pulse done tasks
  public overdueTasks = [];

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  // IsLoading behavior subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  constructor(
    private groupService: GroupsService,
    private postService: PostService,
    private columnService: ColumnService,
    private injector: Injector
  ) { }

  ngOnChanges() {
    // Starts the spinner
    this.isLoading$.next(true);

    this.initView();
  }

  async initView() {

    // Fetches the workspace data
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    // Fetches the groups from the server
    this.projects = await this.getAllProjectColumns(this.groupId)
      .catch(() => {
        // If the function breaks, then catch the error and console to the application
        this.publicFunctions.sendError(new Error('Unable to connect to the server, please try again later!'));
        this.isLoading$.next(false);
      })

    if (!this.projects) {
      this.projects = [];
    }

    // Stops the spinner and return the value with ngOnInit
    return this.isLoading$.next(false);
  }

  /**
   * This function is resposible for fetching first 10 groups present in the workplace
   * @param workspaceId
   */
  public async getAllProjectColumns(parentId: string) {
    if (this.type == 'column') {
      return new Promise((resolve, reject) => {
        this.columnService.getAllProjectColumns(parentId)
          .then((res) => resolve(res['columns']))
          .catch(() => reject([]))
      });
    } else if (this.type == 'group') {
      return new Promise((resolve, reject) => {
        this.columnService.getAllProjectColumns(parentId)
          .then((res) => resolve(res['columns']))
          .catch(() => reject([]))
      });
    }
  }
}
