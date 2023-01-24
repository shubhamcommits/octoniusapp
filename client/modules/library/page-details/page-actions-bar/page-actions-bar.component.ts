import { Component, OnInit, OnChanges, Injector, Input, Output, EventEmitter } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';
import { LibraryService } from 'src/shared/services/library-service/library.service';

@Component({
  selector: 'app-page-actions-bar',
  templateUrl: './page-actions-bar.component.html',
  styleUrls: ['./page-actions-bar.component.scss']
})
export class PageActionsBarComponent implements OnInit, OnChanges {

  @Input() pageData: any;
  @Input() workspaceData: any = {};
  @Input() userData: any = {};
  @Input() canEditPage: boolean = false;
  @Input() showComments: boolean = false;

  @Output() onEditActionEvent = new EventEmitter();
  @Output() onShowCommentsActionEvent = new EventEmitter();

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private injector: Injector,
    public dialog: MatDialog,
    private _router: Router,
    private utilityService: UtilityService,
    private libraryService: LibraryService
  ) { }

  async ngOnInit() {

  }

  async ngOnChanges() {

  }

  canEditAction() {
    this.canEditPage = true;

    this.onEditActionEvent.emit();
  }

  deletePage(pageId: string) {
    // Open the Confirm Dialog to ask for permission
    this.utilityService.getConfirmDialogAlert($localize`:@@pageDetails.areYouSure:Are you sure?`, $localize`:@@pageDetails.byDoingThisPageWillBeDeleted:By doing this the page will be deleted!`)
      .then((res) => {
        if (res.value) {

          // Call the HTTP Service function
          this.utilityService.asyncNotification($localize`:@@pageDetails.pleaseWaitWeRemovingPage:Please wait we are removing your page...`, new Promise((resolve, reject) => {
            this.libraryService.deletePage(pageId, this.workspaceData?._id)
              .then((res) => {
                this.goBack();
                resolve(this.utilityService.resolveAsyncPromise($localize`:@@pageDetails.pageRemoved:Page Removed!`));
              })
              .catch((err) => {
                reject(this.utilityService.rejectAsyncPromise($localize`:@@pageDetails.unableToRemovePage:Unable to remove the page at the moment, please try again!`))
              });
          }));
        }
      });
  }

  async goBack() {
    if (this.pageData && this.pageData._collection) {
      this._router.navigate(
        ['/dashboard', 'work', 'groups', 'library'],
        {
          queryParams: {
            collection: this.pageData._lounge._id
          }
        }
      );
    }
  }

  /**
   * Edit the page with the new value
   */
  async editPage(page: any) {
    this.pageData = page;
  }

  showCommentsAction() {
    this.showComments = !this.showComments;
    this.onShowCommentsActionEvent.emit(this.showComments);
  }

  formateDate(date) {
    return (date) ? DateTime.fromISO(date).toLocaleString(DateTime.DATETIME_MED) : '';
  }
}
