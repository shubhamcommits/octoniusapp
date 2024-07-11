import { Component, EventEmitter, Inject, Injector, OnInit, Output } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-new-time-tracking-dialog',
  templateUrl: './new-time-tracking-dialog.component.html',
  styleUrls: ['./new-time-tracking-dialog.component.scss']
})
export class NewTimeTrackingDialogComponent implements OnInit {

  @Output() newTimeEvent = new EventEmitter();

  tte: any;

  userData: any;
  
  entryAlreadyExists = false;
  
  entryTask;
  entryTaskId;
  entryGroupId;
  entryId;
  entryUserId;
  // entryUserArray = [];
  entryTimeId;
  entryDate;
  entryTime = '00:00';
  entryTimeHours;
  entryTimeMinutes;
  entryCategory;
  entryComment;

  userTasks = [];
  categories = [];

  taskSearchText = '';

  commentPlaceholder = $localize`:@@newTimeTrackingDialog.commentPlaceHolder:Comment`;
  taskSearchPlaceholder = $localize`:@@newTimeTrackingDialog.taskSearchPlaceholder:Search Task`;

  timeTrackingEntities = [];
  timeTrackingEntitiesMapped = [];

  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public utilityService: UtilityService,
    private groupService: GroupService,
    private userService: UserService,
    private injector: Injector,
    private mdDialogRef: MatDialogRef<NewTimeTrackingDialogComponent>
  ) {
    this.tte = (!!this.data) ? this.data.tte : null;
  }

  async ngOnInit() {
    if (!this.userData) {
      this.userData = await this.publicFunctions.getCurrentUser();
    }

    await this.userService.getAllUserTasks().then(res => {
      this.userTasks = res.tasks
    });

    this.initProperties();
  }
  
	async initEntities() {
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
        };
        this.timeTrackingEntitiesMapped.push(tteMapped);
      });
    });
    this.timeTrackingEntitiesMapped = [...this.timeTrackingEntitiesMapped];
	}

  isValidEntry() {
    const index = (!!this.timeTrackingEntitiesMapped)
      ? this.timeTrackingEntitiesMapped.findIndex(tte => ((tte._user._id || tte._user) == this.entryUserId) && ((tte._task._id || tte._task) == this.entryTaskId) && (tte._category == this.entryCategory) && (!!(tte.date) && !!(this.entryDate) && this.isSameDay(tte.date, this.entryDate)))
      : -1;
    if (!!this.entryId) {
      this.entryAlreadyExists = false;
    } else {
      this.entryAlreadyExists = (index >= 0);
    }

    return (!!this.entryDate && !!this.entryTime && this.entryTimeHours && !!this.entryTimeMinutes && !this.entryAlreadyExists);
  }

  async onTaskSelected() {
    this.taskSearchText = '';

    if (!!this.entryTask) {
      this.entryTaskId = this.entryTask._id;
      this.entryGroupId = this.entryTask._group._id || this.entryTask._group;

      await this.groupService.getTimeTrackingEntities(this.entryTaskId).then(async res => {
        this.timeTrackingEntities = res['timeTrackingEntities'];
    
        await this.initEntities();
      });

      await this.groupService.getTimeTrackingCategories(this.entryGroupId).then(res => {
        this.categories = res['categories'];
      });
    }
  }

  saveEntry() {
    const newEntity = {
      _user: this.entryUserId,
      _task: this.entryTaskId,
      _category: this.entryCategory,
      date: this.entryDate,
      hours: this.entryTimeHours,
      minutes: this.entryTimeMinutes,
      comment: this.entryComment,
    };

    this.groupService.saveTimeTrackingEntry(this.entryGroupId, newEntity).then(async (res: any) => {
      this.timeTrackingEntities.push(res.timeTrackingEntity);

      this.newTimeEvent.emit();

      this.closeDialog();
    });
  }

  closeDialog() {
    this.mdDialogRef.close();
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
    this.entryTimeId = timeTrackingEntity.timeId;
    this.entryDate = timeTrackingEntity.date;
    this.entryTimeHours = timeTrackingEntity.hours;
    this.entryTimeMinutes = timeTrackingEntity.minutes;
    this.entryTime = this.entryTimeHours + ':' + this.entryTimeMinutes;
    this.entryCategory = timeTrackingEntity._category;
    this.entryComment = timeTrackingEntity.comment;
  }

  /**
   * This function is responsible for receiving the date from @module <app-date-picker></app-date-picker>
   * @param dateObject
   */
  getDate(dateObject: any) {
    this.entryDate = dateObject.toISODate() || null;
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
  }

  initProperties() {
    if (!!this.tte) {
      this.entryTask = this.tte?._task;
      this.entryTaskId = this.tte?._task?._id;
      this.entryGroupId = this.tte._task?._group?._id;
      this.entryUserId = this.tte?._user?._id;
      this.entryId = this.tte?._id;
      this.entryTimeId = this.tte?.timeId;
      this.entryDate = this.tte?.date;
      this.entryTime = this.tte?.hours + ':' + this.tte?.minutes;
      this.entryTimeHours = this.tte?.hours;
      this.entryTimeMinutes = this.tte?.minutes;
      this.entryCategory = this.tte?._category;
      this.entryComment = this.tte?.comment;
      this.entryAlreadyExists = false;
    } else {
      this.entryTask = null;
      this.entryTaskId = '';
      this.entryGroupId = '';
      this.entryUserId = this.userData?._id;
      this.entryId = '';
      this.entryTimeId = '';
      this.entryDate = '';
      this.entryTime = '00:00';
      this.entryTimeHours = '';
      this.entryTimeMinutes = '';
      this.entryCategory = '';
      this.entryComment = '';
      this.entryAlreadyExists = false;
    }
  }

  isSameDay(day1: any, day2: any) {
    if (!day1 && !day2) {
      return true;
    } else if ((!!day1 && !day2) || (!!day2 && !day1)) {
      return true;
    }
    return moment.utc(day1).isSame(moment.utc(day2), 'day');
  }

  formateDate(date) {
    return (date) ? moment.utc(date).add('1', 'day').format("MMM D, YYYY") : '';
  }
}
