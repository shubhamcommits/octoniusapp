import { Component, Injector, Input, OnChanges } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { MatDialog } from '@angular/material/dialog';
import { CRMGroupService } from 'src/shared/services/crm-group-service/crm-group.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { Sort } from '@angular/material/sort';
import { NewCRMCompanyDialogComponent } from 'modules/groups/group/group-crm-setup-view/new-crm-company-dialog/new-crm-company-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crm-company-list',
  templateUrl: './crm-company-list.component.html',
  styleUrls: ['./crm-company-list.component.scss']
})
export class CRMCompanyListComponent implements OnChanges {

	@Input() companies = [];

	sortedData;
	displayedColumns: string[] = ['image', 'name', 'description', 'star'];

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

		await this.initTable();
	}

	async initTable() {
		this.companies = [...this.companies];

		this.sortedData = this.companies.slice();
	}

	sortData(sort: Sort) {
		const direction = sort.direction;
		let property = sort.active;
		let directionValue = (direction == 'asc') ? 1 : -1;

		const data = this.companies.slice();
		if (!property || direction === '') {
			this.sortedData = data;
			return;
		}

		this.sortedData = data.sort((a, b) => {
			switch (property) {
				default:
					return this.compare(a[property], b[property], directionValue);
			}
		});
	}
	
	private compare(a: number | string, b: number | string, isAsc: number) {
		return (a < b ? -1 : 1) * isAsc;
	}

	openEditCompanyDialog(companyId?: string) {
		const dialogRef = this.dialog.open(NewCRMCompanyDialogComponent, {
			disableClose: true,
			hasBackdrop: true,
			width: '50%',
			data: {
				companyId: companyId
			}
		});

		const companyEditedSubs = dialogRef.componentInstance.companyEdited.subscribe(async (data) => {
			const index = (this.companies) ? this.companies.findIndex(c => c._id == data._id) : -1;
			if (index >= 0) {
				this.companies[index] = data;
			}
			
			await this.initTable();
		});

		const companyCreatedSubs = dialogRef.componentInstance.companyCreated.subscribe(async (data) => {
			if (!this.companies) {
				this.companies = []
			}

			this.companies.unshift(data);

			await this.initTable();
		});

		dialogRef.afterClosed().subscribe(async result => {
			companyEditedSubs.unsubscribe();
			companyCreatedSubs.unsubscribe();
		});
	}

	deleteCompany(companyId: string) {
		this.utilityService.getConfirmDialogAlert($localize`:@@crmCompanyList.areYouSure:Are you sure?`, $localize`:@@crmCompanyList.removeCompany:By doing this, you will delete the selected company!`)
			.then((res) => {
				if (res.value) {
					this.crmGroupService.removeCRMCompany(companyId).then(async res => {
						const index = (this.companies) ? this.companies.findIndex(c => c._id == companyId) : -1;
						if (index >= 0) {
							this.companies.splice(index, 1);

							await this.initTable();
						}
					})
				}
			});
	}
}
