import { Component, EventEmitter, Injector, Input, OnChanges, AfterViewInit, Output } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { MatDialog } from '@angular/material/dialog';
import { CRMGroupService } from 'src/shared/services/crm-group-service/crm-group.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { Sort } from '@angular/material/sort';
import { NewCRMContactDialogComponent } from 'modules/groups/group/group-crm-setup-view/new-crm-contact-dialog/new-crm-contact-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crm-contact-list',
  templateUrl: './crm-contact-list.component.html',
  styleUrls: ['./crm-contact-list.component.scss']
})
export class CRMContactListComponent implements OnChanges, AfterViewInit {

  	@Input() contacts = [];
  	@Input() isAdmin = [];
	@Input() groupData;

	sortedData;
	displayedColumns: string[] = ['name', 'company', 'position', 'phone', 'email', 'link', 'star'];
	crmCustomFieldsToShow = [];

	newColumnSelected;
	crmContactCustomFields = [];

	workspaceData: any;

	isCRMSetupPage = false;

  	public publicFunctions = new PublicFunctions(this.injector);

  	constructor(
		private crmGroupService: CRMGroupService,
		private utilityService: UtilityService,
    	public dialog: MatDialog,
		private router: Router,
    	private injector: Injector
  	) {
		this.isCRMSetupPage = this.router.url.includes('work/groups/crm');
	}

  	async ngOnChanges(): Promise<void> {
		this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

		if (!this.utilityService.objectExists(this.groupData)) {
			this.groupData = await this.publicFunctions.getCurrentGroupDetails();
		}

		await this.crmGroupService.getCRMGroupCustomFields(this.groupData?._id).then(res => {
			this.crmContactCustomFields = res['crm_custom_fields'].filter(cf => !cf.company_type);
		});

		await this.initTable();
  	}

	async ngAfterViewInit() {
		if (!this.utilityService.objectExists(this.groupData)) {
			this.groupData = await this.publicFunctions.getCurrentGroupDetails();
		}
	}

	async initTable() {
		await this.loadCustomFieldsToShow();

		this.contacts = [...this.contacts];

		this.sortedData = this.contacts.slice();
	}

	addNewColumn($event: Event) {
		// Find the index of the column to check if the same named column exist or not
		const index = this.crmCustomFieldsToShow.findIndex((f: any) => f.name.toLowerCase() === this.newColumnSelected.name.toLowerCase());

		// If index is found, then throw error notification
		if (index !== -1) {
			this.utilityService.warningNotification($localize`:@@crmContactList.sectionAlreadyExists:Section already exists!`);
		} else {
			// If not found, then push the element
			// Create the group
			if (!this.groupData.crm_custom_fields_to_show) {
				this.groupData.crm_custom_fields_to_show = [];
			}

			this.groupData.crm_custom_fields_to_show.push(this.newColumnSelected.name);
			this.crmCustomFieldsToShow.push(this.getCustomField(this.newColumnSelected.name));
			if (this.displayedColumns.length - 1 >= 0) {
				this.displayedColumns.splice(this.displayedColumns.length - 1, 0, this.newColumnSelected.name);
			}

			this.newColumnSelected = null;

			this.crmGroupService.saveCRMCustomFieldsToShow(this.groupData._id, this.groupData.crm_custom_fields_to_show)
				.then(res => {
					this.publicFunctions.sendUpdatesToGroupData(this.groupData);
				});
		}
	}

	removeColumn(field: any) {
		let index: number = this.crmCustomFieldsToShow.findIndex(cf => cf.name === field);
		if (index !== -1) {
			this.crmCustomFieldsToShow.splice(index, 1);
		}

		index = this.displayedColumns.indexOf(field.name);
		if (index !== -1) {
			this.displayedColumns.splice(index, 1);
		}

		index = this.groupData.crm_custom_fields_to_show.indexOf(field.name);
		if (index !== -1) {
			this.groupData.crm_custom_fields_to_show.splice(index, 1);
		}

		this.crmGroupService.saveCRMCustomFieldsToShow(this.groupData._id, this.groupData.crm_custom_fields_to_show)
			.then(res => {
				this.publicFunctions.sendUpdatesToGroupData(this.groupData);
			});
	}

	getCustomField(fieldName: string) {
		const index = (this.crmContactCustomFields) ? this.crmContactCustomFields.findIndex((f: any) => f.name === fieldName) : -1;
		return (index >= 0) ? this.crmContactCustomFields[index] : null;
	}

	loadCustomFieldsToShow() {
		if (!!this.groupData && !!this.groupData.crm_custom_fields_to_show) {
			if (!this.crmCustomFieldsToShow) {
				this.crmCustomFieldsToShow = [];
			}
			
			this.groupData.crm_custom_fields_to_show.forEach(field => {
				const cf = this.getCustomField(field);
				const indexCRMCFToShow = (!!this.crmCustomFieldsToShow) ? this.crmCustomFieldsToShow.findIndex(cf => cf.name === field) : -1;
				// Push the Column
				if (cf && indexCRMCFToShow < 0 && !cf.company_type) {
					this.crmCustomFieldsToShow.push(cf);
			
					if (this.displayedColumns.length - 1 >= 0) {
						const indexDisplayedColumns = (!!this.displayedColumns) ? this.displayedColumns.findIndex(col => col === field.name) : -1;
						if (indexDisplayedColumns < 0) {
							this.displayedColumns.splice(this.displayedColumns.length - 1, 0, field);
						}
					}
				}
			});
		}
	}

	sortData(sort: Sort) {
		const direction = sort.direction;
		let property = sort.active;
		let directionValue = (direction == 'asc') ? 1 : -1;

		const data = this.contacts.slice();
		if (!property || direction === '') {
			this.sortedData = data;
			return;
		}

		this.sortedData = data.sort((a, b) => {
			switch (property) {
				case 'company':
					return this.compare(a?._company.name, b?._company.name, directionValue);
				
				case 'phone':
				case 'email':
				case 'link':
					property += 's';
					return this.compare(a[property][0], b[property][0], directionValue);
				default:
					const index = (this.crmContactCustomFields) ? this.crmContactCustomFields.findIndex((f: any) => f.name === property) : -1;
					return (index < 0) ? 
						this.compare(a[property], b[property], directionValue) :
						this.compare(a.crm_custom_fields[property], b.crm_custom_fields[property], directionValue);
			}
		});
	}

	private compare(a: number | string, b: number | string, isAsc: number) {
		return (a < b ? -1 : 1) * isAsc;
	}

	openNewContactDialog(contactId?: string) {
		const dialogRef = this.dialog.open(NewCRMContactDialogComponent, {
		disableClose: true,
		hasBackdrop: true,
		width: '75%',
		height: '85%',
		data: {
			contactId: contactId
		}
		});

		const contactEditedSubs = dialogRef.componentInstance.contactEdited.subscribe(async (data) => {
			const index = (this.contacts) ? this.contacts.findIndex(c => c._id == data._id) : -1;
			if (index >= 0) {
				this.contacts[index] = data;
			}
			
			await this.initTable();
		});

		const contactCreatedSubs = dialogRef.componentInstance.contactCreated.subscribe(async (data) => {
			if (!this.contacts) {
				this.contacts = []
			}

			this.contacts.unshift(data);

			await this.initTable();
		});

		dialogRef.afterClosed().subscribe(async result => {
			contactEditedSubs.unsubscribe();
			contactCreatedSubs.unsubscribe();
		});
  	}

	deleteContact(contactId: string) {
		this.utilityService.getConfirmDialogAlert($localize`:@@crmContactList.areYouSure:Are you sure?`, $localize`:@@crmContactList.removeContact:By doing this, you will delete the selected contact!`)
			.then((res) => {
				if (res.value) {
					this.crmGroupService.removeCRMContact(contactId).then(async res => {
						const index = (this.contacts) ? this.contacts.findIndex(c => c._id == contactId) : -1;
						if (index >= 0) {
							this.contacts.splice(index, 1);

							await this.initTable();
						}
					});
				}
			});
	}
}
