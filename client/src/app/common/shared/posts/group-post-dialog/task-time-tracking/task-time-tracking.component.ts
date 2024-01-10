import { Component, Injector, Input, OnChanges } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { PublicFunctions } from 'modules/public.functions';
import { DateTime } from 'luxon';
import { GroupService } from 'src/shared/services/group-service/group.service';
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
  @Input() taskId: any;
  
  // @Output() openSubtaskEmitter = new EventEmitter();

  showAddTimeForm = false;

  entryId;
  entryUserId;
  entryUserArray = [];
  entryDate;
  entryTime;
  entryTimeHours;
  entryTimeMinutes;
  entryCategory;
  entryComment;

  categories = [];

  commentPlaceholder = $localize`:@@taskTimeTracking.commentPlaceHolder:Comment`;

  timeTrackingEntities = [];

  members = [];

  // sortedData;
	// displayedColumns: string[] = ['image', 'name', 'time', 'comment', 'date', 'category', 'star'];

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
    
    await this.initTable();
  }
  
	async initTable() {
    this.timeTrackingEntities = [...this.timeTrackingEntities];
		// this.sortedData = this.timeTrackingEntities.slice();
	}

  isValidEntry() {
    return !this.showAddTimeForm || (!!this.entryDate && !!this.entryTime && this.entryTimeHours && !!this.entryTimeMinutes && !!this.entryCategory);
  }

  onAssignedAdded(res: any) {
    this.entryUserArray = [res?.assignee];
    this.entryUserId = (res?.assignee?._id || res?.assignee);
  }

  onAssignedRemoved(userId: string) {
    this.entryUserArray = [];
    this.entryUserId = '';
  }

  addNewEntry() {
    if (!this.showAddTimeForm) {
      this.showAddTimeForm = !this.showAddTimeForm
    } else if (!this.entryId) {
      const newEntity = {
        date: this.entryDate,
        hours: this.entryTimeHours,
        minutes: this.entryTimeMinutes,
        _category: this.entryCategory,
        comment: this.entryComment,
        _user: (!!this.entryUserId) ? this.entryUserId : this.userData?._id,
        _task: this.taskId
      }

      this.groupService.saveTimeTrackingEntry(this.groupData._id, newEntity).then(async (res: any) => {
        this.timeTrackingEntities.push(res.timeTrackingEntity);

        await this.initTable();
        
        this.showAddTimeForm = false;

        this.entryUserArray = [];
        this.entryUserId = '';
        this.entryDate = '';
        this.entryTime = '';
        this.entryTimeHours = '';
        this.entryTimeMinutes = '';
        this.entryCategory = '';
        this.entryComment = '';
      });
    } else {
      let editedEntity = {
        _id: this.entryId,
        date: this.entryDate,
        hours: this.entryTimeHours,
        minutes: this.entryTimeMinutes,
        _category: this.entryCategory,
        comment: this.entryComment,
        _user: (!!this.entryUserId) ? this.entryUserId : this.userData?._id,
        _task: this.taskId
      }

      this.groupService.editTimeTrackingEntry(editedEntity).then(async (res: any) => {
        const index = (this.timeTrackingEntities) ? this.timeTrackingEntities.findIndex(tte => tte._id == this.entryId) : -1;
        if (index >= 0) {
          editedEntity._user = this.userData;
          this.timeTrackingEntities[index] = editedEntity;

          await this.initTable();
        }
        this.showAddTimeForm = false;

        this.entryUserArray = [];
        this.entryUserId = '';
        this.entryId = '';
        this.entryDate = '';
        this.entryTime = '';
        this.entryTimeHours = '';
        this.entryTimeMinutes = '';
        this.entryCategory = '';
        this.entryComment = '';
      });
    }
  }

  cancelNewEntry() {
    this.showAddTimeForm = !this.showAddTimeForm;
  }

  onEditEntryEvent(timeTrackingEntity) {
    this.entryId = timeTrackingEntity._id;
    this.entryUserId = timeTrackingEntity?._user?._id || timeTrackingEntity?._user;
    this.entryUserArray = [timeTrackingEntity?._user];
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
    this.entryDate = dateObject.toDate() || null;
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
  }

//   changeEntryCategory() {
// console.log(this.entryCategory);
//   }
}
