import { Component, EventEmitter, Injector, Input, OnChanges, Output } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { PublicFunctions } from 'modules/public.functions';
import { DateTime } from 'luxon';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { ResourcesGroupService } from 'src/shared/services/resources-group-service /resources-group.service';
import { DatesService } from 'src/shared/services/dates-service/dates.service';

@Component({
  selector: 'app-resource-activity-list',
  templateUrl: './resource-activity-list.component.html',
  styleUrls: ['./resource-activity-list.component.scss']
})
export class ResourceActivityListComponent implements OnChanges {

  @Input() activityList: any;
  @Input() resourceId: string;
  @Input() userData: any;
  @Input() isAdmin: any = false;
  
  @Output() editActivityEntityEmitter = new EventEmitter();
  @Output() deleteActivityEntityEmitter = new EventEmitter();

  sortedData;
  displayedColumns: string[] = ['image', 'name', 'description', 'project', 'comment', 'time', 'date', 'star'];

  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private resourcesGroupService: ResourcesGroupService,
    private utilityService: UtilityService,
    private datesService: DatesService,
    private injector: Injector
  ) { }

	async ngOnChanges() {
		await this.initTable();
	}
  
	async initTable() {
		this.sortedData = this.activityList?.slice();    
	}

  sortData(sort: Sort) {
		const direction = sort.direction;
		let property = sort.active;
		let directionValue = (direction == 'asc') ? 1 : -1;

		const data = this.activityList.slice();
		if (!property || direction === '') {
			this.sortedData = data;
			return;
		}

		this.sortedData = data.sort((a, b) => {
			switch (property) {
				case 'description':
					const propertyA = (a['add_inventory']) ? a['quantity'] : (a['quantity']*(-1));
					const propertyB = (b['add_inventory']) ? b['quantity'] : (b['quantity']*(-1));
					return this.utilityService.compare(propertyA, propertyB, directionValue);
				default:
					return this.utilityService.compare(a[property], b[property], directionValue);
			}
		});
	}

	openEditEntry(activityEntity) {
		this.editActivityEntityEmitter.emit(activityEntity);
	}

	deleteEntry(activityEntityId: string) {
		this.utilityService.getConfirmDialogAlert($localize`:@@resourceActivityList.areYouSure:Are you sure?`, $localize`:@@resourceActivityList.remove:By doing this, you will delete the selected activity!`)
				.then((res) => {
					if (res.value) {
						this.resourcesGroupService.removeActivityEntity(this.resourceId, activityEntityId).then(async res => {
							const index = (this.activityList) ? this.activityList.findIndex(act => act._id == activityEntityId) : -1;
							if (index >= 0) {
								this.activityList.splice(index, 1);

								await this.initTable();

								this.deleteActivityEntityEmitter.emit(res['resource']);
							}
						})
					}
				});
	}

	formateDate(date) {
		return this.datesService.formateDate(date, DateTime.DATE_MED);
	}

	formateTime(date) {
		return this.datesService.formateDate(date, DateTime.TIME_SIMPLE);
	}
}
