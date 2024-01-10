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
  @Input() taskId: any;
  
  // @Output() openSubtaskEmitter = new EventEmitter();

  addTime = false;

  entryId;
  entryDate;
  entryTime;
  entryTimeHours;
  entryTimeMinutes;
  entryCategory;
  entryComment;

  categories = [];

  commentPlaceholder = $localize`:@@taskTimeTracking.commentPlaceHolder:Comment`;

  timeTrackingEntities = [];

  // sortedData;
	// displayedColumns: string[] = ['image', 'name', 'time', 'comment', 'date', 'category', 'star'];

  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private groupService: GroupService,
    private utilityService: UtilityService,
    private injector: Injector
  ) { }

  async ngOnChanges() {
    if (!this.userData) {
      this.userData = await this.publicFunctions.getCurrentUser();
    }

    if (!this.groupData) {
      this.groupData = await this.publicFunctions.getCurrentGroupDetails();
    }

    this.groupService.getTimeTrackingCategories(this.groupData._id).then(res => {
      this.categories = res['categories'];
    });

    await this.groupService.getTimeTrackingEntities(this.taskId).then(res => {
      this.timeTrackingEntities = res['timeTrackingEntities'];
    });
    
    await this.initTable();
  }
  
	async initTable() {
    this.timeTrackingEntities = [...this.timeTrackingEntities];
		// this.sortedData = this.timeTrackingEntities.slice();
	}

  // sortData(sort: Sort) {
	// 	const direction = sort.direction;
	// 	let property = sort.active;
	// 	let directionValue = (direction == 'asc') ? 1 : -1;

	// 	const data = this.timeTrackingEntities.slice();
	// 	if (!property || direction === '') {
	// 		this.sortedData = data;
	// 		return;
	// 	}

	// 	this.sortedData = data.sort((a, b) => {
	// 		switch (property) {
  //       case 'time':
  //         return this.compare(a['hours']+':'+a['minutes'], b['hours']+':'+a['minutes'], directionValue);
	// 			default:
	// 				return this.compare(a[property], b[property], directionValue);
	// 		}
	// 	});
	// }

  // private compare(a: number | string, b: number | string, isAsc: number) {
	// 	return (a < b ? -1 : 1) * isAsc;
	// }

  isValidEntry() {
    return !this.addTime || (!!this.entryDate && !!this.entryTime && this.entryTimeHours && !!this.entryTimeMinutes && !!this.entryCategory);
  }

  addNewEntry() {
    if (!this.addTime) {
      this.addTime = !this.addTime
    } else if (!this.entryId) {
      const newEntity = {
        date: this.entryDate,
        hours: this.entryTimeHours,
        minutes: this.entryTimeMinutes,
        _category: this.entryCategory,
        comment: this.entryComment,
        _user: this.userData?._id,
        _task: this.taskId
      }

      this.groupService.saveTimeTrackingEntry(this.groupData._id, newEntity).then(async (res: any) => {
        this.timeTrackingEntities.push(res.timeTrackingEntity);

        await this.initTable();
        
        this.addTime = false;
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
        _user: this.userData?._id,
        _task: this.taskId
      }

      this.groupService.editTimeTrackingEntry(editedEntity).then(async (res: any) => {
        const index = (this.timeTrackingEntities) ? this.timeTrackingEntities.findIndex(tte => tte._id == this.entryId) : -1;
        if (index >= 0) {
          editedEntity._user = this.userData;
          this.timeTrackingEntities[index] = editedEntity;

          await this.initTable();
        }
        this.addTime = false;

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
    this.addTime = !this.addTime;
  }

  onEditEntryEvent(timeTrackingEntity) {
    this.entryId = timeTrackingEntity._id;
    this.entryDate = timeTrackingEntity.date;
    this.entryTimeHours = timeTrackingEntity.hours;
    this.entryTimeMinutes = timeTrackingEntity.minutes;
    this.entryTime = this.entryTimeHours + ':' + this.entryTimeMinutes;
    this.entryCategory = timeTrackingEntity._category;
    this.entryComment = timeTrackingEntity.comment;

    this.addTime = true;
  }

  // deleteEntry(timeTrackingEntityId: string) {
  //   this.utilityService.getConfirmDialogAlert($localize`:@@taskTimeTracking.areYouSure:Are you sure?`, $localize`:@@taskTimeTracking.removeCompany:By doing this, you will delete the selected time record!`)
	// 		.then((res) => {
	// 			if (res.value) {
	// 				this.groupService.removeTimeTrackingEntity(timeTrackingEntityId).then(async res => {
	// 					const index = (this.timeTrackingEntities) ? this.timeTrackingEntities.findIndex(tte => tte._id == timeTrackingEntityId) : -1;
	// 					if (index >= 0) {
	// 						this.timeTrackingEntities.splice(index, 1);

	// 						// await this.initTable();
	// 					}
	// 				})
	// 			}
	// 		});
  // }

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

  // formateDate(date) {
  //   return (date) ? DateTime.fromISO(date).toLocaleString(DateTime.DATE_MED) : '';
  // }
}
