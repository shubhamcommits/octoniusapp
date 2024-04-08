import { Component, EventEmitter, Injector, Input, OnChanges, OnInit, Output } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { ManagementPortalService } from 'src/shared/services/management-portal-service/management-portal.service';
import { PostService } from 'src/shared/services/post-service/post.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-post-dates',
  templateUrl: './post-dates.component.html',
  styleUrls: ['./post-dates.component.scss']
})
export class PostDatesComponent implements OnInit, OnChanges {

  @Input() userData: any;
  @Input() postData: any;
  @Input() groupData: any;
  @Input() canEdit;

  @Output() startDateEvent = new EventEmitter();
  @Output() dueDateEvent = new EventEmitter();
  @Output() timeEvent = new EventEmitter();

  // startDate: any;
  // dueDate: any;
  dueTime: any = {
    hour: 1,
    minute: 30
  };

  canEditDates: boolean = false;

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private utilityService: UtilityService,
    private postService: PostService,
    private managementPortalService: ManagementPortalService,
    private injector: Injector) { }

  ngOnInit() {
    if (this.postData?.type === 'task') {
      // Set the due date variable for task
      if ((this.postData?.task.due_to && this.postData?.task.due_to != null)
        || (this.postData?.event.due_to && this.postData?.event.due_to != null)) {
        // Set the DueDate variable
        // this.dueDate = moment(this.postData?.task.due_to || this.postData?.event.due_to);
      }

      // Set the due date variable for task
      if (this.postData?.task.start_date && this.postData?.task.start_date != null) {
        // Set the DueDate variable
        // this.startDate = moment(this.postData?.task.start_date);
      }
    }

    // If post type is event, set the dueTime
    if (this.postData?.type === 'event') {

      // Set the due date variable for both task and event type posts
      if (this.postData?.event.due_to && this.postData?.event.due_to != null) {

        // Set the DueDate variable
        // this.dueDate = moment(this.postData?.task.due_to || this.postData?.event.due_to);
      }

      // if (this.dueDate) {
      //   this.dueTime.hour = this.dueDate.getHours();
      //   this.dueTime.minute = this.dueDate.getMinutes();
      // }
    }
  }

  async ngOnChanges() {
    this.canEditDates = await this.canUserEditDates();
  }

  canUserEditDates() {
    const isGroupManager = (this.groupData && this.groupData._admins)
      ? (this.groupData?._admins.findIndex((admin: any) => (admin?._id || admin) == this.userData?._id) >= 0)
      : false;
    const isPostOwner = (this.postData && this.postData?._posted_by && this.postData?._posted_by?._id)
      ? this.postData?._posted_by?._id == this.userData?._id
      : ((this.postData?._posted_by && this.postData?._posted_by == this.userData?._id)
        ? true
        : false);

    return (this.canEdit && !this.groupData?.freeze_dates) || (this.canEdit && this.groupData?.freeze_dates && (isGroupManager || isPostOwner));
  }

  formateDate(date) {
    return this.utilityService.formateDate(date, DateTime.DATE_MED)
    // return (date) ? moment(moment.utc(date), "YYYY-MM-DD").toDate() : '';
  }

  /**
   * This function checks the task board if a particular task is overdue or not
   * @param taskPost
   * And applies the respective ng-class
   *
   * -----Tip:- Don't make the date functions asynchronous-----
   *
   */
  checkOverdue() {
    return this.publicFunctions.checkOverdue(this.postData);
  }

  /**
   * This function is responsible for receiving the date from @module <app-date-picker></app-date-picker>
   * @param dateObject
   */
  getDate(dateObject: any, property: string) {
    if (property === 'start_date') {
      // this.startDate = dateObject.toDate();
      this.updateDate(dateObject.toISODate(), property);
    }
    if (property === 'due_date') {
      // this.dueDate = dateObject.toDate();
      this.updateDate(dateObject.toISODate(), property);
    }
  }

  /**
   * This function is responsible to update the date if the date is valid.
   * @param date
   * @param property
   */
  async updateDate(date, property) {
    await this.utilityService.asyncNotification($localize`:@@groupCreatePostDialog.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise(async (resolve, reject) => {
      if (property === 'due_date') {
        const isShuttleTasksModuleAvailable = await this.publicFunctions.isShuttleTasksModuleAvailable();
        const isIndividualSubscription = await this.publicFunctions.checkIsIndividualSubscription();

        this.postService.changeTaskDueDate(this.postData?._id, date?this.formateDate(date):null, isShuttleTasksModuleAvailable, isIndividualSubscription)
        .then((res) => {
          this.postData = res['post'];
          // this.dueDate = moment(this.postData?.task?.due_to);
          this.dueDateEvent.emit(date);
          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupCreatePostDialog.dateUpdated:Date updated!`));
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@groupCreatePostDialog.unableToUpdateDetails:Unable to update the details, please try again!`));
        });

      } else if(property === 'start_date') {
        this.postService.saveTaskDates(this.postData?._id, date?this.formateDate(date):null, property)
          .then((res) => {
            this.postData = res['post'];
            // this.startDate = moment(this.postData?.task?.start_date);
            this.startDateEvent.emit(date);
            // Resolve with success
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupCreatePostDialog.dateUpdated:Date updated!`));
          })
          .catch(() => {
            reject(this.utilityService.rejectAsyncPromise($localize`:@@groupCreatePostDialog.unableToUpdateDetails:Unable to update the details, please try again!`));
          });
      }
    }));
  }

  /**
   * This function is responsible for receiving the time from @module <app-time-picker></app-time-picker>
   * @param timeObject
   */
  getTime(timeObject: any) {
    this.timeEvent.emit(timeObject);
  }
}
