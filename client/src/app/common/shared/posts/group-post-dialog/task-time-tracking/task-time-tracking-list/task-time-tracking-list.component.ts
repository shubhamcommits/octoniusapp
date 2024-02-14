import { Component, EventEmitter, Injector, Input, OnChanges, Output } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { PublicFunctions } from 'modules/public.functions';
import { DateTime } from 'luxon';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { UserService } from 'src/shared/services/user-service/user.service';

@Component({
  selector: 'app-task-time-tracking-list',
  templateUrl: './task-time-tracking-list.component.html',
  styleUrls: ['./task-time-tracking-list.component.scss']
})
export class TaskTimeTrackingListComponent implements OnChanges {

  @Input() timeTrackingEntities: any;
  @Input() userData: any;
  @Input() isAdmin: any = false;
  
  @Output() editTimeTrackingEntitEmitter = new EventEmitter();

  sortedData;
  displayedColumns: string[] = ['image', 'name', 'time', 'date', 'comment', 'category', 'star'];

  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private groupService: GroupService,
    private userService: UserService,
    private utilityService: UtilityService,
    private injector: Injector
  ) { }

  async ngOnChanges() {
    await this.initTable();
  }
  
	async initTable() {
    this.displayedColumns = (this.isAdmin)
      ? ['image', 'name', 'time', 'date', 'comment', 'category', 'cost', 'star']
      : ['image', 'name', 'time', 'date', 'comment', 'category', 'star'];
    this.timeTrackingEntities = [...this.timeTrackingEntities];
		this.sortedData = this.timeTrackingEntities.slice();    
	}

  sortData(sort: Sort) {
		const direction = sort.direction;
		let property = sort.active;
		let directionValue = (direction == 'asc') ? 1 : -1;

		const data = this.timeTrackingEntities.slice();
		if (!property || direction === '') {
			this.sortedData = data;
			return;
		}

		this.sortedData = data.sort((a, b) => {
			switch (property) {
        case 'time':
          return this.utilityService.compare(a['hours']+':'+a['minutes'], b['hours']+':'+a['minutes'], directionValue);
				default:
					return this.utilityService.compare(a[property], b[property], directionValue);
			}
		});
	}

  recalculateCost(timeTrackingEntityId: string, timeId: string) {
    this.utilityService.getConfirmDialogAlert($localize`:@@taskTimeTrackingList.areYouSure:Are you sure?`, $localize`:@@taskTimeTrackingList.recalculate:By doing this, you will re-calculate the cost of the selected time record with the current rate of the user!`)
			.then((res) => {
				if (res.value) {
					this.groupService.recalculateCost(timeTrackingEntityId, timeId).then(async res => {
						const index = (this.timeTrackingEntities) ? this.timeTrackingEntities.findIndex(tte => tte._id == timeTrackingEntityId && tte.timeId == timeId) : -1;
						if (index >= 0) {
							this.timeTrackingEntities[index].cost = res['newCost'];

							await this.initTable();
						}
					})
				}
			});
  }

  openEditEntry(timeTrackingEntity) {
   this.editTimeTrackingEntitEmitter.emit(timeTrackingEntity);
  }

  deleteEntry(timeTrackingEntityId: string, timeId: string) {
    this.utilityService.getConfirmDialogAlert($localize`:@@taskTimeTrackingList.areYouSure:Are you sure?`, $localize`:@@taskTimeTrackingList.remove:By doing this, you will delete the selected time record!`)
			.then((res) => {
				if (res.value) {
					this.groupService.removeTimeTrackingEntity(timeTrackingEntityId, timeId).then(async res => {
						const index = (this.timeTrackingEntities) ? this.timeTrackingEntities.findIndex(tte => tte._id == timeTrackingEntityId) : -1;
						if (index >= 0) {
							this.timeTrackingEntities.splice(index, 1);

							await this.initTable();
						}
					})
				}
			});
  }

  formateDate(date) {
    return this.utilityService.formateDate(date, DateTime.DATE_MED);
  }
}
