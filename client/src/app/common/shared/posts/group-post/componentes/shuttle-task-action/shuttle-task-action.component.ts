import { Component, Injector, Input, OnDestroy, OnChanges, OnInit, Output, EventEmitter } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { PostService } from 'src/shared/services/post-service/post.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { DateTime } from 'luxon';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-shuttle-task-action',
  templateUrl: './shuttle-task-action.component.html',
  styleUrls: ['./shuttle-task-action.component.scss']
})
export class ShuttleTaskActionComponent implements OnChanges, OnInit, OnDestroy {

  @Input() postData: any;
  @Input() groupData: any;
  @Input() userData: any;
  @Input() isShuttleTasksModuleAvailable = false;
  @Input() isIndividualSubscription = false;

  @Output() shuttleGroupEmitter = new EventEmitter();

  shuttleGroups: any = [];;

  // Create subsink class to unsubscribe the observables
  public subSink = new SubSink();

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public utilityService: UtilityService,
    private postService: PostService,
    private injector: Injector,
  ) { }

  async ngOnChanges() {

  }

  async ngOnInit() {
    if (this.groupData && this.groupData?.shuttle_type) {
      const groupId = (this.groupData?._id == this.postData?.task?._shuttle_group) ? null : this.groupData?._id;

      // Fetches shuttle groups from the server
      this.shuttleGroups = await this.publicFunctions.getShuttleGroups(this.groupData?._workspace, groupId)
        .catch(() => {
          // If the function breaks, then catch the error and console to the application
          this.publicFunctions.sendError(new Error($localize`:@@shuttleTaskAction.unableToConnectToServer:Unable to connect to the server, please try again later!`));
        });
      this.shuttleGroups = await this.shuttleGroups.filter(group => {
        return ((!this.postData?.task?.shuttles || this.postData?.task?.shuttles.findIndex(s => (s?._shuttle_group?._id || s?._shuttle_group) == (group?._id || group)) < 0)
          && (this.postData?._group?._id || this.postData?._group) != (group?._id || group))
      });
    }
  }

  /**
   * Unsubscribe all the observables on destroying the component
   */
  ngOnDestroy() {
    this.subSink.unsubscribe()
  }

  showShuttle() {
    let lastShuttle = (this.postData?.task?.shuttles) ? this.postData?.task?.shuttles[0] : null;
    return this.isShuttleTasksModuleAvailable && this.groupData?.shuttle_type && (!this.postData?.task?.shuttle_type
      || (lastShuttle && (lastShuttle?._shuttle_group?._id || lastShuttle?._shuttle_group) == this.groupData?._id));
  }

  async shuttleTask(group: any) {
    this.utilityService.asyncNotification($localize`:@@shuttleTaskAction.pleaseWaitWeAreSavingTask:Please wait we are saving the task...`, new Promise((resolve, reject) => {
      this.postService.selectShuttleGroup(this.postData?._id, group._id)
        .then(async (res) => {
          this.postData = res['post'];
          const index = this.postData?.task?.shuttles?.findIndex(s => (s?._shuttle_group?._id || s?._shuttle_group) == group._id);
          const shuttle = this.postData?.task?.shuttles[index];
          this.shuttleGroupEmitter.emit({
              _shuttle_group: group,
              _shuttle_section: shuttle._shuttle_section,
              shuttle_status: 'to do',
              shuttled_at: DateTime.now()
            });
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@shuttleTaskAction.taskSave:👍 Task saved!`));
        })
        .catch((error) => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@shuttleTaskAction.errorWhileSavingTask:Error while saving the task!`));
        });
    }));
  }
}
