import { Component, Injector, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { ResourcesDetailsDialogComponent } from 'src/app/common/shared/resources-details-dialog/resources-details-dialog.component';
import { ResourcesGroupService } from 'src/shared/services/resources-group-service /resources-group.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { DateTime } from 'luxon';
import { Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { DatesService } from 'src/shared/services/dates-service/dates.service';

@Component({
  selector: 'app-group-resource-management',
  templateUrl: './group-resource-management.component.html',
  styleUrls: ['./group-resource-management.component.scss']
})
export class GroupResourceManagementComponent implements OnInit {

  groupData;
  userData;
  isAdmin = false;
  customFields: any = [];

  resources: any = [];

  sortedData;
  displayedColumns: string[] = ['item', 'quantity', 'unit_price', 'updated', 'description', 'star'];

  customFieldsToShow = [];
  // unchangedTasks: any;
  newColumnSelected;

  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public dialog: MatDialog,
    public utilityService: UtilityService,
    private resourcesGroupService: ResourcesGroupService,
    private datesService: DatesService,
    private _router: Router,
    private injector: Injector
    ) {
      this.sortedData = [];
    }

  async ngOnInit() {
    this.groupData = await this.publicFunctions.getCurrentGroupDetails();
    this.userData = await this.publicFunctions.getCurrentUser();

    this.isAdmin = this.isAdminUser();

    await this.initCustomFields();

    await this.resourcesGroupService.getGroupResources(this.groupData?._id).then(res => {
      this.resources = res['resources'];

      this.resources.forEach(resource => {
        if (!resource.custom_fields) {
          resource.custom_fields = new Map<string, string>()
        }
      });

      this.sortedData = this.resources.slice(); 
    });

    if (this._router.routerState.snapshot.root.queryParamMap.has('id')) {
      const resourceId = this._router.routerState.snapshot.root.queryParamMap.get('id');
      this.openResourceDetailsDialog(resourceId);
    }
  }

  async initCustomFields() {
    /**
     * Obtain the custom fields
     */
    this.customFields = [];
    await this.resourcesGroupService.getGroupResourcesCustomFields(this.groupData?._id).then((res: { [x: string]: { [x: string]: any[]; }; }) => {
      if (!!res['group']['resources_custom_fields']) {
        res['group']['resources_custom_fields'].forEach(field => {
          if (!field.input_type) {
            field.values.sort((v1, v2) => (v1 > v2) ? 1 : -1);
          }
          this.customFields.push(field);
        });
      }
    });

    await this.loadCustomFieldsToShow();
  }

  loadCustomFieldsToShow() {
    if (this.groupData && this.groupData.resources_custom_fields_to_show && this.customFieldsToShow.length === 0) {
      this.groupData.resources_custom_fields_to_show.forEach(field => {
        const cf = this.getCustomField(field);
        // Push the Column
        if (!!cf) {
          if (this.displayedColumns.length - 1 >= 0) {
            const index = (this.displayedColumns) ? this.displayedColumns.indexOf(field.name) : -1;
            if (index < 0) {
              this.displayedColumns.splice(this.displayedColumns.length - 1, 0, field);
            }
          }

          this.customFieldsToShow.push(cf);
        }
      });
    }
  }

  openResourceDetailsDialog(resource?: any) {
    const dialogRef = this.dialog.open(ResourcesDetailsDialogComponent, {
      width: '100%',
      height: '100%',
      disableClose: true,
      data: { resourceId: resource?._id || null }
    });

    const newResourceEventSub = dialogRef.componentInstance.newResourceEvent.subscribe((data) => {
      if (!data.custom_fields) {
        data.custom_fields = new Map<string, string>()
      }
      this.resources.push(data);
      this.resources = [...this.resources];

      this.sortedData = this.resources.slice(); 
    });

    const editedResourceEventSub = dialogRef.componentInstance.editedResourceEvent.subscribe((data) => {
      const index = this.resources.findIndex((resource: any) => resource._id === data._id);
      if (index != -1) {
        this.resources[index] = data;
        this.resources.forEach(resource => {
          if (!resource.custom_fields) {
            resource.custom_fields = new Map<string, string>()
          }
        });

        this.sortedData = this.resources.slice();
      }
    });

    const removeResourceEventSub = dialogRef.componentInstance.removeResourceEvent.subscribe(data => {
      this.deleteResource(data);
    });

    dialogRef.afterClosed().subscribe(result => {
      newResourceEventSub.unsubscribe();
      editedResourceEventSub.unsubscribe();
      removeResourceEventSub.unsubscribe();
    });
  }

  addNewColumn($event: Event) {
    // Find the index of the column to check if the same named column exist or not
    const index = this.customFieldsToShow.findIndex((f: any) => f.name.toLowerCase() === this.newColumnSelected.name.toLowerCase());

    // If index is found, then throw error notification
    if (index !== -1) {
      this.utilityService.warningNotification($localize`:@@resourcesDetailsDialog.columnAlreadyExists:Column already exists!`);
    } else {
      // If not found, then push the element
      if (!this.groupData.resources_custom_fields_to_show) {
        this.groupData.resources_custom_fields_to_show = [];
      }

      this.groupData.resources_custom_fields_to_show.push(this.newColumnSelected.name);
      this.customFieldsToShow.push(this.getCustomField(this.newColumnSelected.name));
      if (this.displayedColumns.length - 1 >= 0) {
        this.displayedColumns.splice(this.displayedColumns.length - 1, 0, this.newColumnSelected.name);
      }

      this.newColumnSelected = null;

      this.resourcesGroupService.saveCustomFieldsToShow(this.groupData._id, this.groupData.resources_custom_fields_to_show);
    }
  }

  removeColumn(field: any) {
    let index: number = this.customFieldsToShow.findIndex(cf => cf.name === field);
    if (index !== -1) {
      this.customFieldsToShow.splice(index, 1);
    }
    index = this.displayedColumns.indexOf(field.name);
    if (index !== -1) {
      this.displayedColumns.splice(index, 1);
    }
    index = this.groupData.resources_custom_fields_to_show.indexOf(field.name);
    if (index !== -1) {
      this.groupData.resources_custom_fields_to_show.splice(index, 1);
    }

    this.resourcesGroupService.saveCustomFieldsToShow(this.groupData._id, this.groupData.resources_custom_fields_to_show);
  }

  customFieldValues(fieldName: string) {
    const cf = this.getCustomField(fieldName);
    return (cf) ? cf.values.sort((v1, v2) => (v1 > v2) ? 1 : -1) : '';
  }

  deleteResource(resourceId: string) {
    this.utilityService.getConfirmDialogAlert($localize`:@@resourcesDetailsDialog.areYouSure:Are you sure?`, $localize`:@@resourcesDetailsDialog.remove:By doing this, you will delete the selected resource!`)
			.then((res) => {
				if (res.value) {
					this.utilityService.asyncNotification($localize`:@@resourcesDetailsDialog.pleaseWaitWeCreateResource:Please wait, while we are creating the resource for you...`, new Promise((resolve, reject) => {
            this.resourcesGroupService.removeResource(resourceId).then(async res => {
              const index = (this.resources) ? this.resources.findIndex(resource => resource._id == resourceId) : -1;
              if (index >= 0) {
                this.resources.splice(index, 1);

                this.sortedData = this.resources.slice();

                resolve(this.utilityService.resolveAsyncPromise($localize`:@@resourcesDetailsDialog.resourceCreated:Resource created!`));
              }
            });
          }));
				}
			});
  }

  async onCustomFieldEmitter(customFields) {
    this.customFields = [...customFields];
    this.groupData = await this.publicFunctions.getCurrentGroupDetails();
  }

  async onExportToEmitter(exportType: any) {
    let exportResources = this.resources.map(resource => {
      let ret = {
        item: resource?.title,
        stock: resource?.stock,
        updated: this.formateDate(resource?.last_updated_date),
        description: resource.description,
      };

      this.customFields.forEach(cf => {
        if (!!resource.custom_fields && !!resource.custom_fields[cf.name]) {
          ret[cf.name] = resource.custom_fields[cf.name];
        }
      });
      return ret;
    });

    this.resourcesGroupService.exportInventoryToFile(exportType, exportResources, this.groupData?.group_name + '_resources');

    this.utilityService.updateIsLoadingSpinnerSource(false);
  }

  sortData(sort: Sort) {
		const direction = sort.direction;
		let property = sort.active;
		let directionValue = (direction == 'asc') ? 1 : -1;

		const data = this.resources.slice();
		if (!property || direction === '') {
			this.sortedData = data;
			return;
		}

		this.sortedData = data.sort((a, b) => {
      switch (property) {
				// case 'quantity':
				// 	return this.utilityService.compare(a.stock, b.stock, directionValue);
				default:
					const index = (this.customFields) ? this.customFields.findIndex((f: any) => f.name === property) : -1;
					return (index < 0) ? 
						this.utilityService.compare(a[property], b[property], directionValue) :
						this.utilityService.compare(a.custom_fields[property], b.custom_fields[property], directionValue);
      }
		});
	}

  getCustomField(fieldName: string) {
    const index = this.customFields.findIndex((f: any) => f.name === fieldName);
    return this.customFields[index];
  }

  getBadgeClass(resource: any) {
    return (!resource.stock || (resource.stock <= 5)) ? 'danger' : (resource.stock <= 20) ? 'warning' : '' ;
  }

  isAdminUser() {
    const index = this.groupData._admins.findIndex((admin: any) => admin._id === this.userData._id);
    return index >= 0;
  }

  formateDate(date) {
    return this.datesService.formateDate(date, DateTime.DATE_MED);
  }
}
