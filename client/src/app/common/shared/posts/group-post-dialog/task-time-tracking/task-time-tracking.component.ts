import { Component, Injector, Input, OnChanges } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment';
// import { DateTime } from 'luxon';
import { GroupService } from 'src/shared/services/group-service/group.service';

@Component({
  selector: 'app-task-time-tracking',
  templateUrl: './task-time-tracking.component.html',
  styleUrls: ['./task-time-tracking.component.scss']
})
export class TaskTimeTrackingComponent implements OnChanges {

  @Input() userData: any;
  @Input() groupData: any;
  @Input() workspaceData: any;
  @Input() taskId: any;
  
  // @Output() openSubtaskEmitter = new EventEmitter();

  showAddTimeForm = false;
  entryAlreadyExists = false;

  entryId;
  entryUserId;
  entryUserArray = [];
  entryTimeId;
  entryDate;
  entryTime;
  entryTimeHours;
  entryTimeMinutes;
  entryCategory;
  entryComment;

  categories = [];
  propertiesEdited = [];

  commentPlaceholder = $localize`:@@taskTimeTracking.commentPlaceHolder:Comment`;

  timeTrackingEntities = [];
  timeTrackingEntitiesMapped = [];

  members = [];

  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private groupService: GroupService,
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
          comment: tte.comment,
        };
        this.timeTrackingEntitiesMapped.push(tteMapped);
      });
    });
    this.timeTrackingEntitiesMapped = [...this.timeTrackingEntitiesMapped];
    // this.timeTrackingEntities = [...this.timeTrackingEntities];
	}

  isValidEntry() {
    const index = (!!this.timeTrackingEntitiesMapped)
      ? this.timeTrackingEntitiesMapped.findIndex(tte => (tte._user._id || tte._user) == this.entryUserId && (tte._task._id || tte._task) == this.taskId && tte._category == this.entryCategory && (!!(tte.date) && !!(this.entryDate) && this.isSameDay(tte.date, this.entryDate)))
      : -1;
    if (!!this.entryId) {
      this.entryAlreadyExists = false;
    } else {
      this.entryAlreadyExists = (index >= 0);
    }
    return !this.showAddTimeForm || (!!this.entryDate && !!this.entryTime && this.entryTimeHours && !!this.entryTimeMinutes && !!this.entryCategory && !this.entryAlreadyExists);
  }

  onAssignedAdded(res: any) {
    this.entryUserArray = [res?.assignee];
    this.entryUserId = (res?.assignee?._id || res?.assignee);
    if (!this.propertiesEdited) {
      this.propertiesEdited = [];
    }
    this.propertiesEdited.push('user');
  }

  onAssignedRemoved(userId: string) {
    this.entryUserArray = [];
    this.entryUserId = '';
  }

  saveEntry() {
    if (!this.showAddTimeForm) {
      this.showAddTimeForm = !this.showAddTimeForm
    } else if (!this.entryId) {
      const newEntity = {
        _user: (!!this.entryUserId) ? this.entryUserId : this.userData?._id,
        _task: this.taskId,
        _category: this.entryCategory,
        times: [{
          date: this.entryDate,
          hours: this.entryTimeHours,
          minutes: this.entryTimeMinutes
        }],
        comment: this.entryComment,
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

      this.groupService.editTimeTrackingEntry(editedEntity, this.propertiesEdited).then(async (res: any) => {
        const index = (this.timeTrackingEntities) ? this.timeTrackingEntities.findIndex(tte => tte._id == this.entryId) : -1;
        if (index >= 0) {
          editedEntity._user = this.userData;
          this.timeTrackingEntities[index] = editedEntity;

          await this.initTable();
        }
        this.showAddTimeForm = false;
        this.initProperties();
      });
    }
  }

  cancelNewEntry() {
    this.showAddTimeForm = !this.showAddTimeForm;
    this.initProperties();
  }

  onEditEntryEvent(timeTrackingEntity: any) {
    this.propertiesEdited = [];
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

  /**
   * This function is responsible for receiving the date from @module <app-date-picker></app-date-picker>
   * @param dateObject
   */
  getDate(dateObject: any) {
    this.entryDate = dateObject.toISOString() || null;

    if (!this.propertiesEdited) {
      this.propertiesEdited = [];
    }
    this.propertiesEdited.push('date');
  }

  getTime(timeObject: any) {
    if (!!this.entryTime) {
      const time = this.entryTime.split(':');
      this.entryTimeHours = time[0];
      this.entryTimeMinutes = time[1];
    } else {
      this.entryTimeHours = '0';
      this.entryTimeMinutes = '0';
    }

    if (!this.propertiesEdited) {
      this.propertiesEdited = [];
    }
    this.propertiesEdited.push('time');
  }

  changeEntryCategory($event: any) {
    if (!this.propertiesEdited) {
      this.propertiesEdited = [];
    }
    this.propertiesEdited.push('category');
  }

  initProperties() {
    this.entryUserArray = [this.userData];
    this.entryUserId = this.userData?._id;
    this.entryId = '';
    this.entryTimeId = '';
    this.entryDate = '';
    this.entryTime = '';
    this.entryTimeHours = '';
    this.entryTimeMinutes = '';
    this.entryCategory = '';
    this.entryComment = '';
    this.propertiesEdited = [];
    this.entryAlreadyExists = false;
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
