import { Component, Injector, Input, OnChanges } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { DatesService } from 'src/shared/services/dates-service/dates.service';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { PostService } from 'src/shared/services/post-service/post.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-task-time-tracking',
  templateUrl: './task-time-tracking.component.html',
  styleUrls: ['./task-time-tracking.component.scss']
})
export class TaskTimeTrackingComponent implements OnChanges {

  @Input() userData: any;
  @Input() groupData: any;
  @Input() workspaceData: any;
  @Input() postData: any;
  
  // @Output() openSubtaskEmitter = new EventEmitter();
  
  taskId: any;

  isAssignedToUser = false;

  showAddTimeForm = false;
  entryAlreadyExists = false;

  entryId;
  entryUserId;
  entryUserArray = [];
  entryTimeId;
  entryDate;
  // entryTime = '00:00';
  entryTime = '';
  entryTimeHours;
  entryTimeMinutes;
  entryCategory;
  entryComment;

  categories = [];

  commentPlaceholder = $localize`:@@taskTimeTracking.commentPlaceHolder:Comment`;

  timeTrackingEntities = [];
  timeTrackingEntitiesMapped = [];

  members = [];

  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private groupService: GroupService,
    private postService: PostService,
    private utilityService: UtilityService,
    private datesService: DatesService,
    private injector: Injector
  ) { }

  async ngOnChanges() {
    if (!this.userData) {
      this.userData = await this.publicFunctions.getCurrentUser();
    }
    
    if (!this.groupData) {
      this.groupData = await this.publicFunctions.getCurrentGroupDetails();
    }

    if (!this.workspaceData) {
      this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    }

    this.taskId = this.postData?._id;

    const index = this.postData?._assigned_to?.findIndex(a => (a._id || a) == this.userData?._id);
    this.isAssignedToUser = (index >=0);

    this.groupService.getTimeTrackingCategories(this.groupData._id).then(res => {
      this.categories = res['categories'];
    });

    await this.groupService.getTimeTrackingEntities(this.taskId).then(res => {
      this.timeTrackingEntities = res['timeTrackingEntities'];
    });

    this.members = await this.publicFunctions.getCurrentGroupMembers();

    this.entryUserArray = [this.userData];
    this.entryUserId = this.userData?._id;

    this.initProperties();
    
    await this.initTable();
  }
  
	async initTable() {
    this.timeTrackingEntitiesMapped = [];

    this.timeTrackingEntities.forEach(tte => {
      tte?.times?.forEach(time => {
        let tteMapped = {
          _id: tte._id,
          _user: tte._user,
          _task: tte._task,
          _category: tte._category,
          timeId: time._id,
          date: time.date,
          hours: time.hours,
          minutes: time.minutes,
          comment: time.comment,
          cost: time.cost,
        };
        this.timeTrackingEntitiesMapped.push(tteMapped);
      });
    });
    this.timeTrackingEntitiesMapped = [...this.timeTrackingEntitiesMapped];
    // this.timeTrackingEntities = [...this.timeTrackingEntities];
	}

  isValidEntry() {
    const index = (!!this.timeTrackingEntitiesMapped)
      ? this.timeTrackingEntitiesMapped.findIndex(tte => ((tte._user._id || tte._user) == this.entryUserId) && ((tte._task._id || tte._task) == this.taskId) && (tte._category == this.entryCategory) && (!!(tte.date) && !!(this.entryDate) && this.isSameDay(tte.date, this.entryDate)))
      : -1;
    if (!!this.entryId) {
      this.entryAlreadyExists = false;
    } else {
      this.entryAlreadyExists = (index >= 0);
    }

    return !this.showAddTimeForm || (!!this.entryDate && !!this.entryTime && this.entryTimeHours && !!this.entryTimeMinutes && !this.entryAlreadyExists);
  }

  saveEntry(propertyEdited?: string) {
    if (!this.showAddTimeForm) {
      this.showAddTimeForm = !this.showAddTimeForm
    } else if (!this.entryId) {
      const newEntity = {
        _user: (!!this.entryUserId) ? this.entryUserId : this.userData?._id,
        _task: this.taskId,
        _category: this.entryCategory,
        date: this.entryDate,
        hours: this.entryTimeHours,
        minutes: this.entryTimeMinutes,
        comment: this.entryComment
      };

      this.groupService.saveTimeTrackingEntry(this.groupData._id, newEntity).then(async (res: any) => {
        this.timeTrackingEntities.push(res.timeTrackingEntity);

        await this.initTable();
        
        this.showAddTimeForm = false;

        this.initProperties();
      });
    } else {
      let editedEntity = {
        _id: this.entryId,
        _user: (!!this.entryUserId) ? this.entryUserId : this.userData?._id,
        _task: this.taskId,
        _category: this.entryCategory,
        timeId: this.entryTimeId,
        date: this.entryDate,
        hours: this.entryTimeHours,
        minutes: this.entryTimeMinutes,
        comment: this.entryComment,
      }

      let entryToEdit;
      const index = (this.timeTrackingEntities) ? this.timeTrackingEntities.findIndex(tte => tte._id == this.entryId) : -1;
      if (index >= 0) {
        entryToEdit = this.timeTrackingEntities[index];
      }

      this.utilityService.asyncNotification($localize`:@@taskTimeTracking.pleaseWait:Please wait we are updating the time...`, new Promise((resolve, reject) => {
        this.groupService.editTimeTrackingEntry(editedEntity, propertyEdited)
          .then(async (res: any) => {
            if (!res.error) {
              this.timeTrackingEntities = res.timeTrackingEntities;

              await this.initTable();

              if (!this.entryId) {
                this.showAddTimeForm = false;
                this.initProperties();
              }

              resolve(this.utilityService.resolveAsyncPromise($localize`:@@taskTimeTracking.timeEdited:Time Edited!`));
            } else {
              this.entryAlreadyExists = true;

              reject(this.utilityService.rejectAsyncPromise($localize`:@@taskTimeTracking.unableToEdited:Unable to edit Time!`));
            }

            this.resetEntityToEdit(editedEntity._id);
          });
      }));
    }
  }

  cancelNewEntry() {
    this.showAddTimeForm = !this.showAddTimeForm;
    this.initProperties();
  }

  resetEntityToEdit(editedEntityId: string) {
    const date = this.entryDate;
    const hours = this.entryTimeHours;
    const minutes = this.entryTimeMinutes;
    const comment = this.entryComment;

    const mappedIndex = (this.timeTrackingEntitiesMapped)
      ? this.timeTrackingEntitiesMapped.findIndex(tte => tte._id == editedEntityId && this.isSameDay(tte.date, date) && tte.hours == hours && tte.minutes == minutes && tte.comment == comment)
      : -1;
    if (mappedIndex >= 0) {
      this.onEditEntryEvent(this.timeTrackingEntitiesMapped[mappedIndex]);
    }
  }

  onEditEntryEvent(timeTrackingEntity: any) {
    this.entryId = timeTrackingEntity._id;
    this.entryUserId = timeTrackingEntity?._user?._id || timeTrackingEntity?._user;
    this.entryUserArray = [timeTrackingEntity?._user];
    this.entryTimeId = timeTrackingEntity.timeId;
    this.entryDate = timeTrackingEntity.date;
    this.entryTimeHours = timeTrackingEntity.hours;
    this.entryTimeMinutes = timeTrackingEntity.minutes;
    this.entryTime = this.entryTimeHours + ':' + this.entryTimeMinutes;
    this.entryCategory = timeTrackingEntity._category;
    this.entryComment = timeTrackingEntity.comment;

    this.showAddTimeForm = true;
  }

  onAssignedAdded(res: any) {
    if (this.entryUserId != (res?.assignee?._id || res?.assignee)) {
      this.entryUserArray = [res?.assignee];
      this.entryUserId = (res?.assignee?._id || res?.assignee);

      if (!!this.entryId && this.isValidEntry()) {
        this.saveEntry('user');
      }
    }
  }

  onAssignedRemoved(userId: string) {
    this.entryUserArray = [];
    this.entryUserId = '';
  }

  /**
   * This function is responsible for receiving the date from @module <app-date-picker></app-date-picker>
   * @param dateObject
   */
  getDate(dateObject: any) {
    const oldDate = this.entryDate;
    this.entryDate = dateObject.toISOString() || null;
    if (!!this.entryId && this.isValidEntry() && !this.isSameDay(this.entryDate, oldDate)) {
      this.saveEntry('date');
    }
  }

  getTime(timeObject: any) {
    this.entryTime = timeObject;

    if (!!this.entryTime) {
      const time = this.entryTime.split(':');
      this.entryTimeHours = time[0];
      this.entryTimeMinutes = time[1];
    } else {
      this.entryTimeHours = '0';
      this.entryTimeMinutes = '0';
    }

    if (!!this.entryId && this.isValidEntry()) {
      this.saveEntry('time');
    }
  }

  changeEntryCategory($event: any) {
    if (!!this.entryId && this.isValidEntry()) {
      this.saveEntry('category');
    }
  }

  onEditComment() {
    if (!!this.entryId && this.isValidEntry()) {
      this.saveEntry('comment')
    }
  }

  initProperties() {
    this.entryUserArray = [this.userData];
    this.entryUserId = this.userData?._id;
    this.entryId = '';
    this.entryTimeId = '';
    this.entryDate = '';
    // this.entryTime = '00:00';
    this.entryTime = '';
    this.entryTimeHours = '';
    this.entryTimeMinutes = '';
    this.entryCategory = '';
    this.entryComment = '';
    this.entryAlreadyExists = false;
  }

  // resetProperties(oldEntity: any) {
  //   this.entryId = oldEntity._id;
  //   this.entryUserId = oldEntity?._user?._id || oldEntity?._user;
  //   this.entryUserArray = [oldEntity?._user];
  //   this.entryTimeId = oldEntity.timeId;
  //   this.entryDate = oldEntity.date;
  //   this.entryTimeHours = oldEntity.hours;
  //   this.entryTimeMinutes = oldEntity.minutes;
  //   this.entryTime = this.entryTimeHours + ':' + this.entryTimeMinutes;
  //   this.entryCategory = oldEntity._category;
  //   this.entryComment = oldEntity.comment;
  // }

  recalculateCosts() {
    this.utilityService.getConfirmDialogAlert($localize`:@@taskTimeTrackingList.areYouSure:Are you sure?`, $localize`:@@taskTimeTrackingList.recalculate:By doing this, you will re-calculate the cost of the selected time record with the current rate of the user!`)
			.then((res) => {
				if (res.value) {
					this.postService.recalculateCost(this.taskId).then(async res => {
						this.timeTrackingEntities = res['timeTrackingEntities'];
            await this.initTable();
					});
				}
			});
  }
  
  isGroupManager(userId) {
    return (this.groupData && this.groupData._admins) ? this.groupData._admins.find(admin => admin._id === userId) : false;
  }
  
  isSameDay(day1: any, day2: any) {
    return this.datesService.isSameDay(day1, day2);
  }

  formateDate(date) {
    return this.datesService.formateDate(date);
  }
}
