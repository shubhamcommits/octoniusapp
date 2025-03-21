import { Component, OnInit, OnDestroy, Injector, AfterContentChecked, Input } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';
import { PublicFunctions } from 'modules/public.functions';
import { Sort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { NewCRMOrderProductDialogComponent } from './new-crm-order-product-dialog/new-crm-order-product-dialog.component';
import { CRMService } from 'src/shared/services/crm-service/crm.service';
import { CRMGroupService } from 'src/shared/services/crm-group-service/crm-group.service';

@Component({
  selector: 'app-crm-order-products',
  templateUrl: './crm-order-products.component.html',
  styleUrls: ['./crm-order-products.component.scss']
})
export class PostCRMOrderProductsComponent implements OnInit, OnDestroy, AfterContentChecked {

	@Input() orders;
	@Input() groupData;
	@Input() postId;
	
	isAdmin = false;

	///////// ORDER TABLE STARTS /////////
	sortedOrderData;
	displayedOrderColumns: string[] = ['name', 'quantity', 'star'];
	// crmProductCustomFieldsToShow = [];
	crmProductCustomFields = [];
	///////// ORDER TABLE STARTS /////////

	// IsLoading behaviou subject maintains the state for loading spinner
	isLoading$;

	// Subsink Object
	subSink = new SubSink();

	// PUBLIC FUNCTIONS
	public publicFunctions = new PublicFunctions(this.injector);

	constructor(
		public utilityService: UtilityService,
		private crmGroupService: CRMGroupService,
		private crmService: CRMService,
		public dialog: MatDialog,
		private injector: Injector) { }


	async ngOnInit() {
		// Start the loading spinner
		this.utilityService.updateIsLoadingSpinnerSource(true);

		this.groupData = await this.publicFunctions.getCurrentGroupDetails();
		// this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
		// this.userData = await this.publicFunctions.getCurrentUser();

		await this.crmService.getCRMInformation().then(res => {
			this.crmProductCustomFields = res['crm_custom_fields']?.filter(cf => cf.type == 'product');
		});

		await this.initOrderTable();

		// End the loading spinner
		this.utilityService.updateIsLoadingSpinnerSource(false);
	}

	ngAfterContentChecked() {
		this.subSink.add(this.utilityService.isLoadingSpinner.subscribe((res) => {
			this.isLoading$ = res;
		}));
	}

	/**
	 * Unsubscribe all the observables to avoid memory leaks
	 */
	ngOnDestroy() {
		this.subSink.unsubscribe();
	}

	async initOrderTable() {
		await this.loadOrderCustomFieldsToShow();

		this.orders = [...this.orders];

		this.sortedOrderData = this.orders.slice();
	}

	getOrderCustomField(fieldName: string) {
		const index = (this.crmProductCustomFields) ? this.crmProductCustomFields.findIndex((f: any) => f.name === fieldName) : -1;
		return (index >= 0) ? this.crmProductCustomFields[index] : null;
	}

	loadOrderCustomFieldsToShow() {
		if (!!this.groupData && !!this.groupData.crm_custom_fields_to_show) {
			if (!this.crmProductCustomFields) {
				this.crmProductCustomFields = [];
			}
			
			this.crmProductCustomFields.forEach(field => {
				if (this.displayedOrderColumns.length - 1 >= 0) {
					const indexDisplayedColumns = (!!this.displayedOrderColumns) ? this.displayedOrderColumns.findIndex(col => col === field.name) : -1;
					if (indexDisplayedColumns < 0) {
						this.displayedOrderColumns.splice(this.displayedOrderColumns.length - 1, 0, field.name);
					}
				}
			});
		}
	}

	sortOrderData(sort: Sort) {
		const direction = sort.direction;
		let property = sort.active;
		let directionValue = (direction == 'asc') ? 1 : -1;

		const data = this.orders.slice();
		if (!property || direction === '') {
			this.sortedOrderData = data;
			return;
		}

		this.sortedOrderData = data.sort((a, b) => {
			switch (property) {
				case 'name':
					return this.utilityService.compare(a._product[property], b._product[property], directionValue);
				case 'quantity':
					return this.utilityService.compare(a[property], b[property], directionValue);
				default:
					const index = (this.crmProductCustomFields) ? this.crmProductCustomFields.findIndex((f: any) => f.name === property) : -1;
					return (index < 0) ? 
						this.utilityService.compare(a[property], b[property], directionValue) :
						this.utilityService.compare(a.crm_custom_fields[property], b.crm_custom_fields[property], directionValue);
			}
		});
	}

	openOrderDialog(order?: any) {
		const dialogRef = this.dialog.open(NewCRMOrderProductDialogComponent, {
			disableClose: true,
			hasBackdrop: true,
			width: '50%',
			data: {
				postId: this.postId,
				orderData: order
			}
		});

		const orderEditedSubs = dialogRef.componentInstance.orderEdited.subscribe(async (data) => {
			const index = (this.orders) ? this.orders.findIndex(o => o._id == data._id) : -1;
			if (index >= 0) {
				this.orders[index] = data;
			}
			
			await this.initOrderTable();
		});

		const orderCreatedSubs = dialogRef.componentInstance.orderCreated.subscribe(async (data) => {
			this.orders = data.crm.orders;

			await this.initOrderTable();
		});

		dialogRef.afterClosed().subscribe(async result => {
			orderEditedSubs.unsubscribe();
			orderCreatedSubs.unsubscribe();
		});
	}

	deleteOrder(orderId: string) {
		this.utilityService.getConfirmDialogAlert($localize`:@@crmCompanyList.areYouSure:Are you sure?`, $localize`:@@crmCompanyList.removeOrder:By doing this, you will delete the selected order!`)
			.then((res) => {
				if (res.value) {
					this.crmGroupService.removeCRMOrder(this.postId, orderId).then(async res => {
						const index = (this.orders) ? this.orders.findIndex(p => p._id == orderId) : -1;
						if (index >= 0) {
							this.orders.splice(index, 1);

							await this.initOrderTable();
						}
					})
				}
			});
	}
}
