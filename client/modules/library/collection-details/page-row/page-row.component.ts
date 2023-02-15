import { Component, Injector, Input, OnInit, OnChanges, Output, EventEmitter } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { MatDialog } from '@angular/material/dialog';
import { LibraryService } from 'src/shared/services/library-service/library.service';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-page-row',
  templateUrl: './page-row.component.html',
  styleUrls: ['./page-row.component.scss']
})
export class PageRowComponent implements OnInit, OnChanges {

	@Input() pageData;
	@Input() userData;
	@Input() workspaceId;

	// Output collection event emitter
	@Output() subpageDeletedEmitter = new EventEmitter();

  	newPageName = $localize`:@@pageRow.newPage:New Page`;

	// Public functions
	public publicFunctions = new PublicFunctions(this.injector);

	constructor(
		public injector: Injector,
		public dialog: MatDialog,
		private utilityService: UtilityService,
		private libraryService: LibraryService
	) { }

	async ngOnInit() {
		// Fetch the current loggedIn user data
		if (!this.objectExists(this.userData)) {
			this.userData = await this.publicFunctions.getCurrentUser();
		}
	}

	async ngOnChanges() {
		this.initSubPages();
	}

	ngOnDestroy() {
	}

	async initSubPages() {
		if (!this.pageData._pages) {
			this.pageData._pages = [];
		}

		await this.libraryService.getPageByParent(this.pageData?._id).then(res => {
			this.pageData._pages = res['pages'];
		});
	}

	async createSubPage() {
		await this.utilityService.asyncNotification($localize`:@@pageRow.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise(async (resolve, reject) => {
			this.libraryService.createPage((this.pageData?._collection?._id || this.pageData?._collection), this.pageData?._id, this.newPageName).then(res => {
				if (!this.pageData._pages) {
					this.pageData._pages = [];
				}

				this.pageData._pages.push(res['page']);

				// Resolve with success
				resolve(this.utilityService.resolveAsyncPromise($localize`:@@pageRow.pageCreated:Page created!`));
			})
			.catch(() => {
				reject(this.utilityService.rejectAsyncPromise($localize`:@@pageRow.unableToCreatePage:Unable to create the page, please try again!`));
			});
		}));
	}

	async deletePage() {
		await this.utilityService.getConfirmDialogAlert().then((result) => {
			if (result.value) {
			// Remove the file
			this.utilityService.asyncNotification($localize`:@@pageRow.pleaseWaitDeleting:Please wait, we are deleting...`, new Promise((resolve, reject) => {
				this.libraryService.deletePage(this.pageData?._id, this.workspaceId).then((res) => {
					this.subpageDeletedEmitter.emit();

					resolve(this.utilityService.resolveAsyncPromise($localize`:@@pageRow.pageDeleted:Page deleted!`));
				}).catch((err) => {
					reject(this.utilityService.rejectAsyncPromise($localize`:@@pageRow.unableToDelete:Unable to delete the page, please try again!`));
				});
			}));
			}
		});
	}

	formateDate(date) {
		return (date) ? DateTime.fromISO(date).toLocaleString(DateTime.DATE_MED) : '';
	}

	objectExists(object: any) {
		return this.utilityService.objectExists(object);
	}
}