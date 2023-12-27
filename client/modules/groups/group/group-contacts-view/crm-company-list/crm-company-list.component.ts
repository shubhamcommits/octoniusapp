import { Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { NewCRMCompanyDialogComponent } from '../new-crm-company-dialog/new-crm-company-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CRMGroupService } from 'src/shared/services/crm-group-service/crm-group.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-crm-company-list',
  templateUrl: './crm-company-list.component.html',
  styleUrls: ['./crm-company-list.component.scss']
})
export class CRMCompanyListComponent implements OnInit {

	@Input() companies = [];

  	@Output() companyEdited = new EventEmitter();
  	@Output() companyDeleted = new EventEmitter();

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

		this.companies.sort((a, b) => {
			if(a[property] < b[property]){
				return -1 * direction;
			}
			else if( a[property] > b[property]){
				return 1 * direction;
			}
			else{
				return 0;
			}
		});
	}

	openEditCompanyDialog(companyId: string) {
		const dialogRef = this.dialog.open(NewCRMCompanyDialogComponent, {
			disableClose: true,
			hasBackdrop: true,
			width: '50%',
			data: {
				companyId: companyId
			}
		});

		const companyEditedSubs = dialogRef.componentInstance.companyEdited.subscribe(async (data) => {
			this.companyEdited.emit(data);
		});

		dialogRef.afterClosed().subscribe(async result => {
			companyEditedSubs.unsubscribe();
		});
	}

	deleteCompany(companyId: string) {
		this.utilityService.getConfirmDialogAlert($localize`:@@crmCompanyList.areYouSure:Are you sure?`, $localize`:@@crmCompanyList.removeCompany:By doing this, you will delete the selected company!`)
			.then((res) => {
				if (res.value) {
					this.crmGroupService.removeCRMCompany(companyId).then(res => {
						this.companyDeleted.emit(companyId);
					})
				}
			});
	}
}
