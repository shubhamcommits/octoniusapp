import { FilesService } from './../../../src/shared/services/files-service/files.service';
import { Component, OnInit, Injector, Output, EventEmitter, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { Subject } from 'rxjs/internal/Subject';
import { SubSink } from 'subsink';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged';
import { MatDialog } from '@angular/material/dialog';
import { PreviewFilesDialogComponent } from 'src/app/common/shared/preview-files-dialog/preview-files-dialog.component';

@Component({
  selector: 'app-group-files',
  templateUrl: './group-files.component.html',
  styleUrls: ['./group-files.component.scss']
})
export class GroupFilesComponent implements OnInit {

  constructor(
    public utilityService: UtilityService,
    private injector: Injector,
    private _router: Router,
    private router: ActivatedRoute,
    private filesService: FilesService,
    public dialog: MatDialog,
  ) { }

  // Delete Event Emitter - Emits delete event
  @Output('delete') delete = new EventEmitter();

  // Fetch groupId from router snapshot
  groupId = this.router.snapshot.queryParamMap.get('group');

  // Base Url of the users uploads
  userBaseUrl = environment.UTILITIES_USERS_UPLOADS;

  // Base Url of the files uploads
  filesBaseUrl = environment.UTILITIES_FILES_UPLOADS;

  // Client Url of the global application
  clientUrl = environment.clientUrl;

  // Current User Data
  userData: any;

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector)

  // Query value variable mapped with search field
  query: string = "";

  // This observable is mapped with query field to recieve updates on change value
  queryChanged: Subject<any> = new Subject<any>();

  // Files array variable
  files: any = [];

  // Folders Array variable
  folders: any = [];

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  // Create subsink class to unsubscribe the observables
  public subSink = new SubSink();

  myWorkplace = this.router.snapshot.queryParamMap.has('myWorkplace') ? this.router.snapshot.queryParamMap.get('myWorkplace') : false


  userGroups = [];
  transferAction = '';
  groupData: any;

  // Variable for lastPostId
  lastFileId: string;

  // More to load maintains check if we have more to load members on scroll
  public moreToLoad: boolean = true;

  async ngOnInit() {

    // Fetch the current user
    this.userData = await this.publicFunctions.getCurrentUser();

    // Fetch the current group
    this.groupData = await this.publicFunctions.getCurrentGroup();

    // Set the lastFileId for scroll
    this.lastFileId = this.files[this.files.length - 1]?._id;

    
    // Fetch the uploaded files from the server

    this.files = await this.publicFunctions.getFiles(this.groupId);


    // Concat the files
    this.files = [...this.files, ...this.folders];

    if (this.groupId && this.userData) {
      // Fetches the user groups from the server
      await this.publicFunctions.getUserGroups(this.groupData._workspace, this.userData._id)
        .then((groups: any) => {

          groups.splice(groups.findIndex(group => group._id == this.groupId), 1);

          this.userGroups = groups;

          this.userGroups.sort((g1, g2) => (g1.group_name > g2.group_name) ? 1 : -1);
          this.utilityService.removeDuplicates(this.userGroups, '_id').then((groups)=>{
            this.userGroups = groups;
          });
        })
        .catch(() => {
          // If the function breaks, then catch the error and console to the application
          this.publicFunctions.sendError(new Error('Unable to connect to the server, please try again later!'));
        });
    }
  }

  getFile(file: any){
    this.files.unshift(file)
  }

  ngAfterViewInit(){
    this.subSink.add(this.queryChanged
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(async (res)=>{

        this.files = await this.publicFunctions.searchFiles(this.groupId, res);
      }))
  }

  /**
   * This function observes the change in the search query variable
   * @param fileQuery
   */
  fileSearchQuery(fileQuery: any) {
    this.queryChanged.next(fileQuery)
  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return !(JSON.stringify(object) === JSON.stringify({}))
  }

  async onScroll() {
    if (this.moreToLoad) {
      // Start the loading spinner
      this.isLoading$.next(true);

      const files: any = await this.publicFunctions.getFiles(this.groupId, this.lastFileId);

      this.files = [...this.files, ...files];

      // Removing duplicates from the array if any
      this.utilityService.removeDuplicates(this.files, '_id').then((files) => {
        this.files = files;
      });

      // Set the lastFileId for scroll
      this.lastFileId = files[files.length - 1]?._id;

      if (files.length < 5) {
        this.moreToLoad = false;
      }

      // Stop the loading spinner
      this.isLoading$.next(false);
    }
  }

  /**
   * Unsubscribe all the observables on destroying the component
   */
  ngOnDestroy() {
    this.subSink.unsubscribe()
    this.isLoading$.complete()
  }

  /**
   * Call function to delete file
   * @param fileId
   */
  deleteFile(fileId: string) {
    // Ask User to remove this file or not
    this.utilityService.getConfirmDialogAlert()
      .then((result) => {
        if (result.value) {
          // Remove the file
          this.utilityService.asyncNotification('Please wait we are deleting the file...', new Promise((resolve, reject) => {
            this.filesService.deleteFile(fileId)
              .then((res) => {
                // Emit the Deleted file to all the components in order to update the UI
                this.delete.emit(res['file']);

                // Remove the file from the list
                this.files = this.files.filter(file => file._id !== fileId);

                resolve(this.utilityService.resolveAsyncPromise('File deleted!'));
              }).catch((err) => {
                reject(this.utilityService.rejectAsyncPromise('Unable to delete file, please try again!'));
              });
          }));
        }
      });
  }

  openViewFileDialog(fileUrl: string) {
    const dialogRef = this.dialog.open(PreviewFilesDialogComponent, {
      width: '90%',
      height: '90%',
      data: {
        url: fileUrl
      }
    });
  }

  openViewFolioDialog(folioId: string) {
    const dialogRef = this.dialog.open(PreviewFilesDialogComponent, {
      width: '90%',
      height: '90%',
      data: {
        id: folioId,
        group: this.groupId
      }
    });
  }

  /**
   * This function is responsible for copying the folio link to the clipboard
   */
  copyToClipboard(fileId: string) {

    // Create Selection Box
    let selBox = document.createElement('textarea');

    // Set the CSS Properties
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';

    selBox.value = environment.clientUrl + '/document/' + fileId + '?group=' + this.groupId + '&readOnly=true';
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
    this.utilityService.simpleNotification(`Copied to Clipboard!`);
  }

  saveTransferAction(action: string) {
    this.transferAction = action;
  }

  transferToGroup(fileId: string, group: string) {
    if (this.transferAction === 'copy') {
      this.copyToGroup(fileId, group);
    }
    if (this.transferAction === 'move') {
      this.moveToGroup(fileId, group);
    }
    this.transferAction = '';
  }

  async copyToGroup(fileId: string, group: string) {
    // Open the Confirm Dialog to ask for permission
    this.utilityService.getConfirmDialogAlert('Are you sure?', 'By doing this the folio will be copied to the selected group!')
      .then(async (res) => {
        if (res.value) {
          await this.utilityService.asyncNotification('Please wait we are copy the folio...', new Promise((resolve, reject) => {
            this.filesService.transferToGroup(fileId, group, true).then((res) => {
                resolve(this.utilityService.resolveAsyncPromise(`👍 Folio Copied!`));
              })
              .catch((error) => {
                reject(this.utilityService.rejectAsyncPromise(`Error while copying the folio!`));
              });
          }));
        }
      });
  }

  async moveToGroup(fileId: string, groupId: string) {
    // Open the Confirm Dialog to ask for permission
    this.utilityService.getConfirmDialogAlert('Are you sure?', 'By doing this the folio will be moved to the selected group!')
      .then(async (res) => {
        if (res.value) {
          await this.utilityService.asyncNotification('Please wait we are move the folio...', new Promise((resolve, reject) => {
            this.filesService.transferToGroup(fileId, groupId, false)
              .then((res) => {
                // Remove the file from the list
                // this.files.splice(this.files.findIndex(file => file._id == fileId), 1);

                // Redirect to the new group files page
                this._router.navigate(['/dashboard', 'work', 'groups', 'files'], { queryParams: { group: groupId, myWorkplace: false } });
                resolve(this.utilityService.resolveAsyncPromise(`👍 Folio Moved!`));
              })
              .catch((error) => {
                reject(this.utilityService.rejectAsyncPromise(`Error while moving the folio!`));
              });
          }));
        }
      });
  }
}
