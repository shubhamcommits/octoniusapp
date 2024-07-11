import { Component, Inject, Injector, LOCALE_ID, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Router } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged';
import { environment } from 'src/environments/environment';
import { LibraryService } from 'src/shared/services/library-service/library.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-share-collection-dialog',
  templateUrl: './share-collection-dialog.component.html',
  styleUrls: ['./share-collection-dialog.component.scss']
})
export class ShareCollectionDialogComponent implements OnInit {

  collectionData: any;
  groupData: any;
  workspaceData: any;

  groupSearchModel = '';
  groupSearchPlaceholder = $localize`:@@shareCollectionDialog.searchGroup:Search for a group`;
  groupsList: any = [];
  groupSearchModelChanged: Subject<Event> = new Subject<Event>();

  userSearchModel = '';
  userSearchPlaceholder = $localize`:@@shareCollectionDialog.searchUser:Search for a user`;
  usersList: any = [];
  userSearchModelChanged: Subject<Event> = new Subject<Event>();

  public isLoading$ = new BehaviorSubject(false);

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  public subSink = new SubSink();

  constructor(
    @Inject(LOCALE_ID) public locale: string,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public utilityService: UtilityService,
    public injector: Injector,
    private mdDialogRef: MatDialogRef<ShareCollectionDialogComponent>,
    private _router: Router,
    private libraryService: LibraryService
    ) {
  }

  async ngOnInit() {
    this.collectionData = this.data.collectionData;

    if (!this.utilityService.objectExists(this.groupData)) {
      this.groupData = await this.publicFunctions.getCurrentGroupDetails();
    }

    if (!this.utilityService.objectExists(this.workspaceData)) {
      this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    }

    if (!this.collectionData?.share) {
      this.collectionData.share = {};
    }

    if (!this.collectionData?.share?.open_link) {
      this.collectionData.share.open_link = {
        status: false,
        can_edit: false
      };
    }
  }

  ngAfterViewInit() {
    this.subSink.add(this.groupSearchModelChanged
      .pipe(distinctUntilChanged(), debounceTime(500))
      .subscribe(async () => {
        if (!!this.groupSearchModel) {
          this.groupsList = await this.publicFunctions.searchAllGroupsList(this.workspaceData?._id, this.groupSearchModel, this.groupData?._id);
        }

        this.isLoading$.next(false);
      }));
    
    this.subSink.add(this.userSearchModelChanged
      .pipe(distinctUntilChanged(), debounceTime(500))
      .subscribe(async () => {
        if (!!this.userSearchModel) {
          this.usersList = await this.publicFunctions.searchAllUsersList(this.workspaceData?._id, this.userSearchModel);
        }

        this.isLoading$.next(false);
      }));
  }

  changeCollectionOpenLink(event: any) {

    if (!this.collectionData?.share) {
      this.collectionData.share = {};
    }

    this.utilityService.asyncNotification($localize`:@@shareCollectionDialog.pleaseWaitUpdatingShare:Please wait we are updating the collection...`,
        new Promise((resolve, reject)=>{
          this.libraryService.editCollection(this.collectionData?._id, { share: this.collectionData?.share }).then(res => {
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@shareCollectionDialog.collectionUpdated:Collection updated!`));
          })
          .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@shareCollectionDialog.unableToUpdate:Unable to update the collection`)))
      }));
  }

  changeOpenLinkRigth($event: any) {
    this.utilityService.asyncNotification($localize`:@@shareCollectionDialog.pleaseWaitUpdatingShare:Please wait we are updating the collection...`,
      new Promise((resolve, reject)=>{
        this.collectionData.share.open_link.can_edit = $event;
        this.libraryService.editCollection(this.collectionData?._id, { share: this.collectionData?.share }).then(res => {
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@shareCollectionDialog.collectionUpdated:Collection updated!`));
        })
        .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@shareCollectionDialog.unableToUpdate:Unable to update the collection`)))
    }));
  }

  onGroupSearch($event: Event) {
    // Set loading state to be true
    this.isLoading$.next(true);

    // Set the groupSearchModelChanged
    this.groupSearchModelChanged.next($event);

    // Set loading state to be true
    this.isLoading$.next(false);
  }

  modelGroupChange($event: any) {
    this.groupSearchModel = $event;
    if ($event == "" || $event === null || $event === undefined) {
      this.groupsList = [];
    }
  }

  selectGroup(group) {

    if (!this.collectionData?.share) {
      this.collectionData.share = {};
    }

    if (!this.collectionData?.share?.groups) {
      this.collectionData.share.groups = [];
    }

    const index = (this.collectionData?.share?.groups) ? this.collectionData?.share?.groups?.findIndex(sharedGroup => sharedGroup?._group?._id == group?._id) : -1;
    if (index < 0) {
      this.utilityService.asyncNotification($localize`:@@shareCollectionDialog.pleaseWaitUpdatingShare:Please wait we are updating the collection...`,
        new Promise((resolve, reject)=>{
          this.collectionData?.share?.groups?.push({_group: group, can_edit: false});
          this.libraryService.editCollection(this.collectionData?._id, { share: this.collectionData?.share }).then(res => {
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@shareCollectionDialog.collectionUpdated:Collection updated!`));
          })
          .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@shareCollectionDialog.unableToUpdate:Unable to update the collection`)))
      }));
    }

    this.groupSearchModel = '';
    this.groupsList = [];
  }

  changeGroupRigth($event: any, sharedGroup: any) {

    const index = (this.collectionData?.share?.groups) ? this.collectionData?.share?.groups?.findIndex(sharedGroupTmp => sharedGroupTmp?._group?._id == sharedGroup?._group?._id) : -1;
    if (index >= 0) {
      this.utilityService.asyncNotification($localize`:@@shareCollectionDialog.pleaseWaitUpdatingShare:Please wait we are updating the collection...`,
        new Promise((resolve, reject)=>{
          this.collectionData.share.groups[index].can_edit = $event;
          this.libraryService.editCollection(this.collectionData?._id, { share: this.collectionData?.share }).then(res => {
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@shareCollectionDialog.collectionUpdated:Collection updated!`));
          })
          .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@shareCollectionDialog.unableToUpdate:Unable to update the collection`)))
      }));
    }
  }

  removeGroup(groupId: any) {
    const index = (this.collectionData?.share?.groups) ? this.collectionData?.share?.groups?.findIndex(sharedGroupTmp => sharedGroupTmp?._group?._id == groupId) : -1;
    if (index >= 0) {
      this.utilityService.asyncNotification($localize`:@@shareCollectionDialog.pleaseWaitUpdatingShare:Please wait we are updating the collection...`,
        new Promise((resolve, reject)=>{
          this.collectionData.share.groups.splice(index, 1);
          this.libraryService.editCollection(this.collectionData?._id, { share: this.collectionData?.share }).then(res => {
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@shareCollectionDialog.collectionUpdated:Collection updated!`));
          })
          .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@shareCollectionDialog.unableToUpdate:Unable to update the collection`)))
      }));
    }
  }

  onUserSearch($event: Event) {
    // Set loading state to be true
    this.isLoading$.next(true);

    // Set the groupSearchModelChanged
    this.userSearchModelChanged.next($event);

    // Set loading state to be true
    this.isLoading$.next(false);
  }

  modelUserChange($event: any) {
    this.userSearchModel = $event;
    if ($event == "" || $event === null || $event === undefined) {
      this.usersList = [];
    }
  }

  selectUser(user) {

    if (!this.collectionData?.share) {
      this.collectionData.share = {};
    }

    if (!this.collectionData?.share?.users) {
      this.collectionData.share.users = [];
    }

    const index = (this.collectionData?.share?.users) ? this.collectionData?.share?.users?.findIndex(sharedUser => sharedUser?._user?._id == user?._id) : -1;
    if (index < 0) {
      this.utilityService.asyncNotification($localize`:@@shareCollectionDialog.pleaseWaitUpdatingShare:Please wait we are updating the collection...`,
        new Promise((resolve, reject)=>{
          this.collectionData?.share?.users?.push({_user: user, can_edit: false});
          this.libraryService.editCollection(this.collectionData?._id, { share: this.collectionData?.share }).then(res => {
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@shareCollectionDialog.collectionUpdated:Collection updated!`));
          })
          .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@shareCollectionDialog.unableToUpdate:Unable to update the collection`)))
      }));
    }

    this.userSearchModel = '';
    this.usersList = [];
  }

  changeUserRigth($event: any, sharedUser: any) {

    const index = (this.collectionData?.share?.users) ? this.collectionData?.share?.users?.findIndex(sharedUserTmp => sharedUserTmp?._user?._id == sharedUser?._user?._id) : -1;
    if (index >= 0) {
      this.utilityService.asyncNotification($localize`:@@shareCollectionDialog.pleaseWaitUpdatingShare:Please wait we are updating the collection...`,
        new Promise((resolve, reject)=>{
          this.collectionData.share.users[index].can_edit = $event;
          this.libraryService.editCollection(this.collectionData?._id, { share: this.collectionData?.share }).then(res => {
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@shareCollectionDialog.collectionUpdated:Collection updated!`));
          })
          .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@shareCollectionDialog.unableToUpdate:Unable to update the collection`)))
      }));
    }
  }

  removeUser(userId: any) {
    const index = (this.collectionData?.share?.users) ? this.collectionData?.share?.users?.findIndex(sharedUserTmp => sharedUserTmp?._user?._id == userId) : -1;
    if (index >= 0) {
      this.utilityService.asyncNotification($localize`:@@shareCollectionDialog.pleaseWaitUpdatingShare:Please wait we are updating the collection...`,
        new Promise((resolve, reject)=>{
          this.collectionData.share.users.splice(index, 1);
          this.libraryService.editCollection(this.collectionData?._id, { share: this.collectionData?.share }).then(res => {
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@shareCollectionDialog.collectionUpdated:Collection updated!`));
          })
          .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@shareCollectionDialog.unableToUpdate:Unable to update the collection`)))
      }));
    }
  }

  async copyCollectionLink() {
    // Create Selection Box
    let selBox = document.createElement('textarea');

    // Set the CSS Properties
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';

    let url = environment.clientUrl;
    if (environment.production) {
      url += '/' + this.locale;
    }

    url += this._router.url;
    
    selBox.value = url;
    // Append the element to the DOM
    document.body.appendChild(selBox);

    // Set the focus and Child
    selBox.focus();
    selBox.select();

    // Execute Copy Command
    document.execCommand('copy');

    // Once Copied remove the child from the dom
    document.body.removeChild(selBox);

    // Show Confirmed notification
    this.utilityService.simpleNotification($localize`:@@flamingoPublish.copiedToClipboard:Copied to Clipboard!`);
  }

  cancel() {
    // Close the modal
    this.mdDialogRef.close();
  }
}
