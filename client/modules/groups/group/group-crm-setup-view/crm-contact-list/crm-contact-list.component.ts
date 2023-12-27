import { Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
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
export class CRMContactListComponent implements OnInit {

  	@Input() contacts = [];

	@Output() contactEdited = new EventEmitter();
	@Output() contactDeleted = new EventEmitter();

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

  	async ngOnInit(): Promise<void> {
		this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
  	}

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
