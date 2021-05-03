import { Component, OnInit, Injector, Output, EventEmitter } from '@angular/core';
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
import { FilesService } from './../../../src/shared/services/files-service/files.service';
import { FoldersService } from 'src/shared/services/folders-service/folders.service';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { StorageService } from 'src/shared/services/storage-service/storage.service';

@Component({
  selector: 'app-group-files',
  templateUrl: './group-files.component.html',
  styleUrls: ['./group-files.component.scss']
})
export class GroupFilesComponent implements OnInit {

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

  // Folders Array variable
  forms: any = [];

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  // Create subsink class to unsubscribe the observables
  public subSink = new SubSink();

  myWorkplace = this.router.snapshot.queryParamMap.has('myWorkplace') ? this.router.snapshot.queryParamMap.get('myWorkplace') : false

  editFolderTitle = false;
  currentFolder: any;
  folderOriginalName = '';

  userGroups = [];
  transferAction = '';
  groupData: any;

  // Variable for lastPostId
  lastFileId: string;

  workspaceId: string;

  authToken: string;

  // More to load maintains check if we have more to load members on scroll
  public moreToLoad: boolean = true;

  constructor(
    public utilityService: UtilityService,
    private injector: Injector,
    private _router: Router,
    private router: ActivatedRoute,
    private filesService: FilesService,
    private foldersService: FoldersService,
    public dialog: MatDialog,
    public storageService: StorageService
  ) { }

  async ngOnInit() {

    // Fetch the current user
    this.userData = await this.publicFunctions.getCurrentUser();

    // Fetch the current group
    this.groupData = await this.publicFunctions.getCurrentGroup();

    const folderId = await this.router.snapshot.queryParamMap.has('folder') ? this.router.snapshot.queryParamMap.get('folder') : false
    if (!folderId) {
      await this.initRootFolder();
    } else {
      await this.openFolder(folderId);
    }

    if (this.groupData && this.groupData._workspace && this.groupId && this.userData) {
      this.workspaceId = this.groupData._workspace;

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

    this.authToken = `Bearer ${this.storageService.getLocalData('authToken')['token']}`
  }

  ngAfterViewInit(){
    this.subSink.add(this.queryChanged
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(async (res)=>{

        this.files = await this.publicFunctions.searchFiles(this.groupId, res);
      }))
  }

  /**
   * Unsubscribe all the observables on destroying the component
   */
  ngOnDestroy() {
    this.subSink.unsubscribe()
    this.isLoading$.complete()
  }

  getFile(file: any) {
    this.files.unshift(file);
  }

  getFolder(folder: any) {
    this.folders.unshift(folder);
  }

  getForm(form: any){
    this.forms.unshift(form);
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

      if(files) {
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
      }

      // Stop the loading spinner
      this.isLoading$.next(false);
    }
  }

  /**
   * Call function to delete file or a folder
   * @param itemId
   */
  deleteItem(itemId: string, type: string, fileName?: string) {
    // Ask User to remove this file or not
    this.utilityService.getConfirmDialogAlert()
      .then((result) => {
        if (result.value) {
          // Remove the file
          this.utilityService.asyncNotification('Please wait, we are deleting...', new Promise((resolve, reject) => {
            if (type == 'file' || type == 'folio' || type == 'flamingo') {
              this.filesService.deleteFile(itemId, fileName, type == 'flamingo')
                .then((res) => {
                  // Emit the Deleted file to all the components in order to update the UI
                  this.delete.emit(res['file']);

                  // Remove the file from the list
                  this.files = this.files.filter(file => file._id !== itemId);

                  resolve(this.utilityService.resolveAsyncPromise('File deleted!'));
                }).catch((err) => {
                  reject(this.utilityService.rejectAsyncPromise('Unable to delete file, please try again!'));
                });
            } else {
              this.foldersService.deleteFolder(itemId)
                .then((res) => {
                  // Emit the Deleted folder to all the components in order to update the UI
                  this.delete.emit(res['folder']);

                  // Remove the folder from the list
                  this.files = this.files.filter(file => file._id !== itemId);

                  resolve(this.utilityService.resolveAsyncPromise('Folder deleted!'));
                }).catch((err) => {
                  reject(this.utilityService.rejectAsyncPromise('Unable to delete folder, please try again!'));
                });
            }
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

  transferToGroup(itemId: string, group: string, type: string) {
    if (this.transferAction == 'copy') {
      this.copyToGroup(itemId, group, type);
    }
    if (this.transferAction == 'move') {
      this.moveToGroup(itemId, group, type);
    }
    this.transferAction = '';
  }

  async copyToGroup(itemId: string, group: string, type: string) {
    // Open the Confirm Dialog to ask for permission
    this.utilityService.getConfirmDialogAlert('Are you sure?', 'By doing this the item will be copied to the selected group!')
      .then(async (res) => {
        if (res.value) {
          await this.utilityService.asyncNotification('Please wait, we are copying the Folio...', new Promise((resolve, reject) => {
            this.filesService.transferToGroup(itemId, group, true).then((res) => {
                resolve(this.utilityService.resolveAsyncPromise(`👍 Folio Copied!`));
              })
              .catch((error) => {
                reject(this.utilityService.rejectAsyncPromise(`Error while copying the Folio!`));
              });
          }));
        }
      });
  }

  async moveToGroup(itemId: string, groupId: string, type: string) {
    // Open the Confirm Dialog to ask for permission
    this.utilityService.getConfirmDialogAlert('Are you sure?', 'By doing this the item will be moved to the selected group!')
      .then(async (res) => {
        if (res.value) {
          await this.utilityService.asyncNotification('Please wait we are moving the item...', new Promise((resolve, reject) => {
            this.filesService.transferToGroup(itemId, groupId, false)
              .then((res) => {
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

  /**
   * Method used to open a selected folder
   */
  async openFolder(folderId: string) {

    // Start the loading spinner
    this.isLoading$.next(true);

    // Clean the files, folders and current folder content to retreive the new folder content
    this.folders = [];
    this.files = [];
    this.currentFolder = null;
    this.folderOriginalName = '';

    if (folderId == 'root') {
      await this.initRootFolder();
    } else {
      this.foldersService.getOne(folderId)
        .then(res => {
          this.currentFolder = res['folder'];
          this.folderOriginalName = this.currentFolder.folder_name;
        });

      // Fetch the uploaded files from the server
      this.folders = await this.publicFunctions.getFolders(this.groupId, folderId);

      const parentFolder = {
        _id: this.currentFolder?._parent || 'root',
        folder_name: '../',
        type: undefined
      }
      this.folders.unshift(parentFolder);

      // Fetch the uploaded files from the server
      this.files = await this.publicFunctions.getFiles(this.groupId, folderId);

      // Set the lastFileId for scroll
      this.lastFileId = this.files[this.files.length - 1]?._id;
    }

    // Stop the loading spinner
    this.isLoading$.next(false);
  }

  /**
   * Used to modify the title of the current folder
   */
  changeFolderTitle(event: any) {
    // KeyCode = 13 - User hits enter
    if (event.keyCode == 13) {

      // Set the edit title to false
      this.editFolderTitle = false

      this.foldersService.edit(this.currentFolder._id, event.target.value).then((res) => {
        this.currentFolder.folder_name = event.target.value;
        this.folderOriginalName = this.currentFolder.folder_name;
        this.utilityService.resolveAsyncPromise(`👍 Folder Moved!`);
      })
      .catch((error) => {
        this.utilityService.rejectAsyncPromise(`Error while moving the folder!`);
      });
    }

    // KeyCode = 27 - User Hits Escape
    else if (event.keyCode == 27) {

      // Set the name back to previous state
      this.currentFolder.folder_name = this.folderOriginalName

      // Only Set the edit title to false
      this.editFolderTitle = false
    }

  }

  /**
   * This method is used to init the root folder in the groups files page
   */
  async initRootFolder() {

    // Fetch the uploaded files from the server
    this.folders = await this.publicFunctions.getFolders(this.groupId);

    // Fetch the uploaded files from the server
    this.files = await this.publicFunctions.getFiles(this.groupId, null);

    if (this.files) {
      // Set the lastFileId for scroll
      this.lastFileId = this.files[this.files.length - 1]?._id;
    }

    this.currentFolder = null;
  }

  /**
   * This function is used to return the mime type icon based on the extension of the fileName
   * @param fileName - Name of the file to obtain the icon img
   */
  getFileIcon(fileName: string) {
    let file = fileName.split(".");
    let fileType = file[file.length-1].toLowerCase();
    if (fileType == 'mp4') {
      fileType = 'mov';
    }
    return "assets/images/" + fileType + "-file-icon.png";
  }

  /**
   * Methods for Drop files to upload
   */
  /**
   * This function is responsible for uploading the files to the server
   * @param files
   */
   fileDropped(files: FileList) {

    // Loop through each file and begin the process of uploading
    Array.prototype.forEach.call(files, (file: File) => {
      let fileData = {
        _group: this.groupId,
        _folder: (this.currentFolder) ? this.currentFolder._id : null,
        _posted_by: this.userData._id,
        type: 'file',
        mime_type: '',
        _workspace: this.workspaceId
      }
      // Adding Mime Type of the file uploaded
      fileData.mime_type = file.type

      // Call the Upload file service function
      this.uploadFile(fileData, file);
    });
  }

  /**
   * This function is responsible for uploading a file to the server
   * @param fileData
   * @param file
   */
  uploadFile(fileData: any, file?: File) {
    // Call the HTTP Request Asynschronously
    this.utilityService.asyncNotification(
      (file) ? `Please wait, we are uploading your file - ${file['name']} ...` : `Please wait while we are creating a new folio`,
      new Promise((resolve, reject) => {
        this.filesService.addFile(fileData, file)
          .then((res) => {

            // Output the created file to the top components
            this.getFile(res['file']);
            resolve((file) ? this.utilityService.resolveAsyncPromise('File has been uploaded!') :
              this.utilityService.resolveAsyncPromise('New file has been uploaded!'))

          })
          .catch(() => {
            reject(this.utilityService.rejectAsyncPromise('Unexpected error occured while uploading, please try again!'))
          })
      }))
  }

  /**
   * This method move the item to a specific folder
   *
   * @param itemId item to move
   * @param folderId destination folder
   * @param type type of item to move
   */
  moveToFolder(itemId: string, folderId: string, type: string) {
    // Ask User to remove this file or not
    this.utilityService.getConfirmDialogAlert()
      .then((result) => {
        if (result.value) {
          // Move the item
          this.utilityService.asyncNotification('Please wait, we are moving the item...', new Promise((resolve, reject) => {
            if (type == 'file') {
              this.filesService.moveToFolder(itemId, folderId)
                .then((res) => {
                  // Remove the file from the list
                  this.files = this.files.filter(file => file._id !== itemId);

                  resolve(this.utilityService.resolveAsyncPromise('File moved!'));
                }).catch((err) => {
                  reject(this.utilityService.rejectAsyncPromise('Unable to move the file, please try again!'));
                });
            } else if (type == 'folder') {
              this.foldersService.moveToFolder(itemId, folderId)
                .then((res) => {
                  // Remove the file from the list
                  this.folders = this.folders.filter(folder => folder._id !== itemId);

                  resolve(this.utilityService.resolveAsyncPromise('Folder moved!'));
                }).catch((err) => {
                  reject(this.utilityService.rejectAsyncPromise('Unable to move the folder, please try again!'));
                });
            }
          }));
        }
      });
  }
}
