import { Component, Injector, Input, OnChanges, OnInit } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GroupsService } from 'src/shared/services/groups-service/groups.service';
import { PostService } from 'src/shared/services/post-service/post.service';

@Component({
  selector: 'app-global-performance-card',
  templateUrl: './global-performance-card.component.html',
  styleUrls: ['./global-performance-card.component.scss']
})
export class GlobalPerformanceCardComponent implements OnChanges {

  @Input() period;

  // Workspace data
  public workspaceData: Object = {};

  // Pulse groups
  public groups: any = [];

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
    this.groups = await this.getGlobalPerformanceGroups(this.workspaceData['_id'])
      .catch(() => {
        // If the function breaks, then catch the error and console to the application
        this.publicFunctions.sendError(new Error($localize`:@@globalPerformaceCard.unableToConnectServer:Unable to connect to the server, please try again later!`));
        this.isLoading$.next(false);
      })

    if (!this.groups) {
      this.groups = [];
    }

    // Calculate the pulse tasks via calling the APIs
    await this.calculateTasksNumbers();

    // Stops the spinner and return the value with ngOnInit
    return this.isLoading$.next(false);
  }

  /**
   * This function is resposible for fetching first 10 groups present in the workplace
   * @param workspaceId
   */
  public async getGlobalPerformanceGroups(workspaceId: string) {
    return new Promise((resolve, reject) => {
      this.groupService.getGlobalPerformanceGroups(workspaceId, this.period)
        .then((res) => resolve(res['groups']))
        .catch(() => reject([]))
    })
  }

  /**
   * This function calculates the tasks count for all the groups including all the status
   */
  public async calculateTasksNumbers() {

    // Iterating over the net array to calculate the tasks count
    for (let i = 0; i < this.groups.length; i++) {

      if (this.groups[i]) {
        // Get all tasks count for a group
        this.totalTasks[this.groups[i]._id] = await this.getTasksCount(this.groups[i]._id);

        // Get all tasks count having status as 'to do'
        this.toDoTasks[this.groups[i]._id] = await this.getTasksCount(this.groups[i]._id, 'to do');

        // Get all tasks count having status as 'in progress'
        this.inProgressTasks[this.groups[i]._id] = await this.getTasksCount(this.groups[i]._id, 'in progress');

        // Get all tasks count having status as 'done'
        this.doneTasks[this.groups[i]._id] = this.totalTasks[this.groups[i]._id] - (this.toDoTasks[this.groups[i]._id] + this.inProgressTasks[this.groups[i]._id]);

        this.overdueTasks[this.groups[i]._id] = await this.getOverdueTasksCount(this.groups[i]._id);

        const percentageDone = (this.totalTasks[this.groups[i]._id] + this.overdueTasks[this.groups[i]._id] > 0) ? (((this.doneTasks[this.groups[i]._id])*100)/(this.totalTasks[this.groups[i]._id] + this.overdueTasks[this.groups[i]._id])) : 0;
        this.groups[i].completitionPercentage = Math.round(percentageDone);

        this.groups[i].projectStatusClass = "pulse_tweet " + this.setStatusClass(this.groups[i].project_status, false);
        this.groups[i].completitionPercentageClass = "badge " + this.setStatusClass(this.groups[i].project_status, true);
      }
    }
  }

  /**
   * This function returns the count of tasks of pulse for specific status
   * @param groupId
   * @param status - optional
   */
  public async getTasksCount(groupId: string, status?: string) {
    return new Promise((resolve, reject) => {
      this.groupService.getGlobalPerformanceTasks(groupId, this.period, status)
        .then((res) => resolve(res['numTasks']))
        .catch(() => reject(0));
    })
  }

  async getOverdueTasksCount(groupId: string) {
    return new Promise((resolve, reject) => {
      this.postService.getGroupPosts(groupId, 'task', this.period, true)
        .then((res) => {
          resolve(res['posts'].length)
        })
        .catch(() => {
          reject([])
        })
    })
  }

  setStatusClass(status, isBadge) {
    if (isBadge) {
      if (status === 'NOT STARTED') {
        return 'badge_not_started';
      } else if (status === 'ON TRACK') {
        return 'badge_on_track';
      } else if (status === 'IN DANGER') {
        return 'badge_in_danger';
      } else if (status === 'ACHIEVED') {
        return 'badge_achieved';
      }
    } else {
      if (status === 'NOT STARTED') {
        return 'not_started';
      } else if (status === 'ON TRACK') {
        return 'on_track';
      } else if (status === 'IN DANGER') {
        return 'in_danger';
      } else if (status === 'ACHIEVED') {
        return 'achieved';
      }
    }
  }
}
