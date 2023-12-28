import { Component, EventEmitter, Injector, Input, OnChanges, AfterViewInit, Output } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { NewCRMContactDialogComponent } from '../new-crm-contact-dialog/new-crm-contact-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CRMGroupService } from 'src/shared/services/crm-group-service/crm-group.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-crm-contact-list',
  templateUrl: './crm-contact-list.component.html',
  styleUrls: ['./crm-contact-list.component.scss']
})
export class CRMContactListComponent implements OnChanges, AfterViewInit {

  	@Input() contacts = [];
  	@Input() isAdmin = [];
	@Input() groupData;

	@Output() contactEdited = new EventEmitter();
	@Output() contactDeleted = new EventEmitter();



	///////////////
	displayedColumns: string[] = ['name', 'description', 'phone', 'email', 'link', 'star'];
	crmCustomFieldsToShow = [];

	newColumnSelected;
	crmCustomFields = [];
	///////////////

  	isDesc: boolean = false;
  	column: string = '';
	direction: number;

	workspaceData: any;

  	public publicFunctions = new PublicFunctions(this.injector);

  	constructor(
		private crmGroupService: CRMGroupService,
		private utilityService: UtilityService,
    	public dialog: MatDialog,
    	private injector: Injector
  	) { }

  	async ngOnChanges(): Promise<void> {
		this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

		if (!this.utilityService.objectExists(this.groupData)) {
			this.groupData = await this.publicFunctions.getCurrentGroupDetails();
		}

		await this.crmGroupService.getCRMGroupCustomFields(this.groupData?._id).then(res => {
			this.crmCustomFields = res['crm_custom_fields'];
		});

		await this.loadCustomFieldsToShow();
  	}

	async ngAfterViewInit() {
		if (!this.utilityService.objectExists(this.groupData)) {
			this.groupData = await this.publicFunctions.getCurrentGroupDetails();
		}
		
		
	}


	///////////////
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

			this.crmGroupService.saveCRMCustomFieldsToShow(this.groupData._id, this.groupData.crm_custom_fields_to_show);
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

		this.crmGroupService.saveCRMCustomFieldsToShow(this.groupData._id, this.groupData.crm_custom_fields_to_show);
	}

	getCustomField(fieldName: string) {
		const index = this.crmCustomFields.findIndex((f: any) => f.name === fieldName);
		return this.crmCustomFields[index];
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
				if (cf && indexCRMCFToShow < 0) {
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
	///////////////

	sort(property: string) {
		this.isDesc = !this.isDesc; //change the direction    
		this.column = property;
		let direction = this.isDesc ? 1 : -1;

		this.contacts.sort((a, b) => {
			switch (property) {
				case 'company':
					if (a?.company_history[0]?._company.name < b?.company_history[0]?._company.name){
						return -1 * direction;
					} else if ( a?.company_history[0]?._company.name > b?.company_history[0]?._company.name){
						return 1 * direction;
					} else {
						return 0;
					}
				
				case 'phones':
				case 'emails':
				case 'links':
					if (a[property][0] < b[property][0]){
						return -1 * direction;
					} else if ( a[property][0] > b[property][0]){
						return 1 * direction;
					} else {
						return 0;
					}
				default:
					if (a[property] < b[property]){
						return -1 * direction;
					} else if ( a[property] > b[property]){
						return 1 * direction;
					} else {
						return 0;
					}
			}
		});
	}

	openNewContactDialog(contactId: string) {
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
		this.contactEdited.emit(data);
		});

		dialogRef.afterClosed().subscribe(async result => {
		contactEditedSubs.unsubscribe();
		});
  	}

	deleteContact(contactId: string) {
		this.utilityService.getConfirmDialogAlert($localize`:@@crmContactList.areYouSure:Are you sure?`, $localize`:@@crmContactList.removeContact:By doing this, you will delete the selected contact!`)
			.then((res) => {
				if (res.value) {
					this.crmGroupService.removeCRMContact(contactId).then(res => {
						this.contactDeleted.emit(contactId);
					});
				}
			});
	}
}
