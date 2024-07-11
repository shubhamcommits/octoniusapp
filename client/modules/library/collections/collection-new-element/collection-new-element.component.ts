import { Component, OnInit, OnDestroy, Output, Input, Injector, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { ThemeService } from 'ng2-charts';
import { BehaviorSubject } from 'rxjs';
import { LibraryService } from 'src/shared/services/library-service/library.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { ConfluenceImportDialogComponent } from './confluence-import-dialog/confluence-import-dialog.component';

@Component({
  selector: 'app-collection-new-element',
  templateUrl: './collection-new-element.component.html',
  styleUrls: ['./collection-new-element.component.scss']
})
export class CollectionNewElementComponent implements OnInit, OnDestroy {

  @Input() canCreate: boolean = true;

  // Output collection event emitter
  @Output() collectionEmitter = new EventEmitter();

  userData: any;
  groupData: any;
  workspaceData: any;

  collections: any = [];

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  // Public Functions Instance
  public publicFunctions = this.Injector.get(PublicFunctions);

  // Collection Data variable
  newCollectionData: any = {
    _created_by: '',
    _group: '',
    collection_avatar: 'assets/images/icon-new-group.svg'
  };

  constructor(
    public Injector: Injector,
    public dialog: MatDialog,
    private utilityService: UtilityService,
    private libraryService: LibraryService
  ) { }

  async ngOnInit() {
    this.userData = await this.publicFunctions.getCurrentUser();
    this.groupData = await this.publicFunctions.getCurrentGroupDetails();
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
  }

  ngOnDestroy() {
    this.isLoading$.complete()
  }

  async createCollection() {
    await this.utilityService.asyncNotification($localize`:@@collectionNewElement.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise(async (resolve, reject) => {
      await this.initCollection();

      this.newCollectionData.name = $localize`:@@collectionNewElement.newCollection:New Collection`;

      this.libraryService.createCollection(this.newCollectionData).then(res => {
        this.collectionEmitter.emit([res['collection']]);
        this.initCollection();

        // Resolve with success
        resolve(this.utilityService.resolveAsyncPromise($localize`:@@collectionNewElement.detailsUpdated:Details updated!`));
      })
      .catch(() => {
        reject(this.utilityService.rejectAsyncPromise($localize`:@@collectionNewElement.unableToUpdateDetails:Unable to update the details, please try again!`));
      });
    }));
  }

  initCollection() {
    // Set the File Credentials after view initialization
    this.newCollectionData = {
      _created_by: this.userData?._id,
      _group: this.groupData?._id
    }
  }

  openImportDialog() {
    const dialogRef = this.dialog.open(ConfluenceImportDialogComponent, {
      // width: '80%',
      // height: '900%',
      disableClose: true,
      hasBackdrop: true,
      data: {  }
    });

    const sub = dialogRef.componentInstance.spacesImportedEvent.subscribe((data) => {
      if (data) {
        this.collectionEmitter.emit(data);
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      sub.unsubscribe();
    });
  }
}
