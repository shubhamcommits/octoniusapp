import { Component, OnInit, Injector, HostListener } from '@angular/core';
import { GroupsService } from 'src/shared/services/groups-service/groups.service';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { SubSink } from 'subsink';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-pulse',
  templateUrl: './pulse.component.html',
  styleUrls: ['./pulse.component.scss']
})
export class PulseComponent implements OnInit {

  constructor(
    private groupService: GroupsService,
    private injector: Injector
  ) { }

  // Base URL
  baseUrl = environment.UTILITIES_GROUPS_UPLOADS;

  // Workspace data
  public workspaceData: Object = {};

  // LastGroupId
  public lastGroupId: string = '';

  // Pulse groups
  public pulseGroups: any = [];

  // Pulse total tasks
  public pulseTotalTasks = [];

  // Pulse to do tasks
  public pulseToDoTasks = [];

  // Pulse in progress tasks
  public pulseInProgressTasks = [];

  // Pulse done tasks
  public pulseDoneTasks = [];

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  // Utility Service
  public utilityService = this.injector.get(UtilityService);

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  // More to load maintains check if we have more to load groups on scroll
  public moreToLoad: boolean = true;

  // Subsink to add subscriptions to this array
  public subSink = new SubSink();

  async ngOnInit() {
    // Starts the spinner
    this.isLoading$.next(true);

    // Fetches the workspace data
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    // Fetches the groups from the server
    this.pulseGroups = await this.getAllPulseGroups(this.workspaceData['_id'])
      .catch(() => {
        // If the function breaks, then catch the error and console to the application
        this.publicFunctions.sendError(new Error($localize`:@@workPulse.unableToConnectToServer:Unable to connect to the server, please try again later!`));
        this.isLoading$.next(false);
      })

    // Initialises the lastGroupId variable
    this.lastGroupId = this.pulseGroups[this.pulseGroups.length - 1]['_id'];

    // Calculate the pulse tasks via calling the APIs
    await this.calculatePulseTasks(this.pulseGroups);

    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'work'
    });

    // Stops the spinner and return the value with ngOnInit
    return this.isLoading$.next(false);
  }


  /**
   * This function is resposible for fetching first 10 groups present in the workplace
   * @param workspaceId
   */
  public async getAllPulseGroups(workspaceId: string) {
    return new Promise((resolve, reject) => {
      this.groupService.getPulseGroups(workspaceId)
        .then((res) => resolve(res['groups']))
        .catch(() => reject([]))
    })
  }

  /**
   * This function is resposible for fetching next 5 groups present based on the lastGroupId
   * @param workspaceId
   * @param lastGroupId
   */
  public async getNextPulseGroups(workspaceId: string, lastGroupId: string) {
    return new Promise((resolve, reject) => {
      this.groupService.getNextPulseGroups(workspaceId, lastGroupId)
        .then((res) => resolve(res['groups']))
        .catch(() => reject([]))
    })
  }

  /**
   * This function returns the count of tasks of pulse for specific status
   * @param groupId
   * @param status - optional
   */
  public async getTasksCount(groupId: string, status?: string) {
    return new Promise((resolve, reject) => {
      this.groupService.getPulseTasks(groupId, status)
        .then((res) => resolve(res['numTasks']))
        .catch(() => reject(0));
    })
  }

  /**
   * This function calculates the tasks count for all the groups including all the status
   */
  public async calculatePulseTasks(pulseGroups: any) {

    // Iterating over the net array to calculate the tasks count
    for (let i = 0; i < pulseGroups.length; i++) {

      // Get all tasks count for a group
      this.pulseTotalTasks[pulseGroups[i]._id] = await this.getTasksCount(pulseGroups[i]._id);

      // Get all tasks count having status as 'to do'
      this.pulseToDoTasks[pulseGroups[i]._id] = await this.getTasksCount(pulseGroups[i]._id, 'to do');

      // Get all tasks count having status as 'in progresss'
      this.pulseInProgressTasks[pulseGroups[i]._id] = await this.getTasksCount(pulseGroups[i]._id, 'in progress');

      // Get all tasks count having status as 'done'
      this.pulseDoneTasks[pulseGroups[i]._id] = this.pulseTotalTasks[pulseGroups[i]._id] - (this.pulseToDoTasks[pulseGroups[i]._id] + this.pulseInProgressTasks[pulseGroups[i]._id]);
    }
  }

  /**
   * This function loads more groups into the pulseGroups array
   */
  public async onScroll() {
    if (this.moreToLoad) {
      await this.scrolled();
    }
  }

  /**
   * Helper function of onScroll to work on the business logic
   */
  public async scrolled() {
    if (this.pulseGroups && this.lastGroupId && this.lastGroupId != '' && this.lastGroupId != null) {

      // Fetching next pulse groups based on the lasgGroupId
      let nextPulseGroups: any = await this.getNextPulseGroups(this.workspaceData['_id'], this.lastGroupId);

      // If we have 0 groups, then stop the function immediately and set moreToLoad to false
      if (nextPulseGroups.length == 0) {
        this.moreToLoad = false;
        this.isLoading$.next(false);
      }

      // If we have groups then calculate the pulse tasks for fetched groups
      if (this.moreToLoad) {

        // Adding into exisiting array
        this.pulseGroups = [...this.pulseGroups, ...nextPulseGroups];

        // Updating lastGroupId with the lastest fetched data
        this.lastGroupId = this.pulseGroups[this.pulseGroups.length - 1]['_id'];

        // // Calculate the pulse tasks count via calling the APIs
        await this.calculatePulseTasks(nextPulseGroups);
      }

    }
  }

  /**
   * This function opens the sweet alert model for the pulse details
   * @param title
   * @param imageUrl
   */
  openModal(title: string, imageUrl: string, pulse: string, todo: number, inprogress: number, done: number) {

    // Swal modal for update details
    return this.utilityService.getSwalModal({
      html:
        `<div class="form-group inline-elements">
                <label class="group-name-label"><strong>Group Name</strong></label>
                <p class="group-elements-content">${title}</p>
        </div>` +

        `<div class="form-group inline-elements">
                <label class="group-pulse-label"><strong>This week's Pulse</strong></label>
                <p class="group-elements-content">${pulse}</p>
        </div>` +

        `<div class="form-group inline-elements">
                <label class="group-todo-tasks"><strong>To Do Tasks this week</strong></label>
                <p class="group-elements-content">${todo}</p>
        </div>` +

        `<div class="form-group inline-elements">
                <label class="group-in-progress-tasks"><strong>In Progress Tasks this week</strong></label>
                <p class="group-elements-content">${inprogress}</p>
        </div>` +

        `<div class="form-group inline-elements">
                <label class="group-done-tasks"><strong>Done Tasks this week</strong></label>
                <p class="group-elements-content">${done}</p>
        </div>` +

        `<div class="form-group inline-elements">
                <label class="group-total-tasks"><strong>Total Tasks this week</strong></label>
                <p class="group-elements-content">${todo + inprogress + done}</p>
        </div>`,

      focusConfirm: false,
      showConfirmButton: true,
      showCancelButton: false,
      cancelButtonText: 'Cancel',
      cancelButtonColor: '#d33',
      scrollbarPadding: true,
      imageUrl: imageUrl,
      imageAlt: title,
      imageWidth: 200,
      imageHeight: 200,
      grow: 'column',
      customClass: {
        content: 'content-class',
        container: 'container-class',
      }
    })
  }

  ngOnDestroy(){
    this.isLoading$.complete()
  }

}
