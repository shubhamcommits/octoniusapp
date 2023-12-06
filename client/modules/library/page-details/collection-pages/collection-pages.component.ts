import { Component, Injector, Input, OnInit, OnChanges, Output, EventEmitter } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { MatDialog } from '@angular/material/dialog';
import { LibraryService } from 'src/shared/services/library-service/library.service';
import { DateTime } from 'luxon';
import { ActivatedRoute } from '@angular/router';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';

/** Flat node with expandable and level information */
interface PageFlatNode {	
	_id: string;
	expandable: boolean;
	title: string;
	level: number;
}

@Component({
  selector: 'app-collection-pages',
  templateUrl: './collection-pages.component.html',
  styleUrls: ['./collection-pages.component.scss'],
//   imports: [MatTreeModule, MatButtonModule, MatIconModule],
})
export class CollectionPagesComponent implements OnInit, OnChanges {

	@Input() pages = [];
	@Input() collectionId;
	@Input() userData;
	@Input() workspaceId;
	@Input() canEdit;
	
	// Output collection event emitter
	@Output() subpageUpdatedEmitter = new EventEmitter();
	// @Output() subpageCreatedEmitter = new EventEmitter();
	// @Output() subpageDeletedEmitter = new EventEmitter();
	
  currentPageId;
  selectedNodeId;
  menuDisplayed = true; 
  postTitle: any;
  canEditSubTitle: boolean;

  newPageName = $localize`:@@pageRow.newPage:New Page`;
  reachedMaxNestedPage = $localize`:@@collectionDetails.reachedMaxNestedPage:Reached max nested page`;

	private _transformer = (page: any, level: number) => {
		return {
			_id: page._id,
			expandable: !!page._pages && page._pages.length > 0,
			title: page.title,
			level: level,
		};
	};

	treeControl = new FlatTreeControl<PageFlatNode>(
		node => node.level,
		node => node.expandable,
	);

	treeFlattener = new MatTreeFlattener(
		this._transformer,
		page => page.level,
		page => page.expandable,
		page => page._pages,
	);

	dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

	hasChild = (_: number, node: PageFlatNode) => node.expandable;
	getLevel = (node: PageFlatNode) => node.level;

	// Public functions
	public publicFunctions = new PublicFunctions(this.injector);

	constructor(
		public injector: Injector,
		public dialog: MatDialog,
		private activatedRoute: ActivatedRoute,
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
		this.dataSource.data = this.pages;

		this.treeControl.expandAll();

		this.currentPageId = this.activatedRoute.snapshot.queryParams['page'];
	}

	ngOnDestroy() {
	}

  async createSubPage(parentPageId: string, parentLevel: any) {
    this.newPageName = this.postTitle;

		await this.utilityService.asyncNotification($localize`:@@pageRow.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise(async (resolve, reject) => {
      this.libraryService.createPage(this.collectionId, parentPageId, this.newPageName).then(async res => {
        if (!this.pages) {
          this.pages = [];
        }
        this.pages.push(res['page']);
				this.subpageUpdatedEmitter.emit();

				// Resolve with success
				resolve(this.utilityService.resolveAsyncPromise($localize`:@@pageRow.pageCreated:Page created!`));
			})
			.catch(() => {
				reject(this.utilityService.rejectAsyncPromise($localize`:@@pageRow.unableToCreatePage:Unable to create the page, please try again!`));
			});
    }));

    // Clear the postTitle and reset input field
    this.postTitle = undefined;
    this.toggleInputField();
	}

	async deletePage(page: any) {
		await this.utilityService.getConfirmDialogAlert().then((result) => {
			if (result.value) {
				// Remove the file
				this.utilityService.asyncNotification($localize`:@@pageRow.pleaseWaitDeleting:Please wait, we are deleting...`, new Promise((resolve, reject) => {
					this.libraryService.deletePage(page?._id, this.workspaceId).then(async (res) => {
						this.subpageUpdatedEmitter.emit();

						resolve(this.utilityService.resolveAsyncPromise($localize`:@@pageRow.pageDeleted:Page deleted!`));
					}).catch((err) => {
						reject(this.utilityService.rejectAsyncPromise($localize`:@@pageRow.unableToDelete:Unable to delete the page, please try again!`));
					});
				}));
			}
		});
  }
  
  toggleInputField(id?) {
    this.menuDisplayed = !this.menuDisplayed;
    this.canEditSubTitle = !this.canEditSubTitle;
    this.postTitle = undefined;
    this.selectedNodeId = id;
  }

	formateDate(date) {
		return (date) ? DateTime.fromISO(date).toLocaleString(DateTime.DATE_MED) : '';
	}

	objectExists(object: any) {
		return this.utilityService.objectExists(object);
	}
}