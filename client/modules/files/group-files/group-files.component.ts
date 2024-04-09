import { Component, OnInit, Injector, Output, EventEmitter, LOCALE_ID, Inject } from '@angular/core';
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
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { FlamingoService } from 'src/shared/services/flamingo-service/flamingo.service';
import { FileDetailsDialogComponent } from 'src/app/common/shared/file-details-dialog/file-details-dialog.component';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { pdfExporter } from "quill-to-pdf";
import { saveAs } from "file-saver";
import { PDFDocument } from 'pdf-lib';
import { ApprovalPDFSignaturesService } from 'src/shared/services/approval-pdf-signatures-service/approval-pdf-signatures.service';
import { DateTime } from 'luxon';

import ReconnectingWebSocket from 'reconnecting-websocket';
import * as ShareDB from "sharedb/lib/client";
import Quill from 'quill';
import { ManagementPortalService } from 'src/shared/services/management-portal-service/management-portal.service';

@Component({
  selector: 'app-group-files',
  templateUrl: './group-files.component.html',
  styleUrls: ['./group-files.component.scss']
})
export class GroupFilesComponent implements OnInit {

  // Delete Event Emitter - Emits delete event
  @Output('delete') delete = new EventEmitter();

  baseAPIUrl = environment.UTILITIES_BASE_API_URL;

  // Client Url of the global application
  clientUrl = environment.clientUrl;

  // Current User Data
  userData: any;

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

  editFolderTitle = false;
  currentFolder: any;
  folderOriginalName = '';

  userGroups = [];
  transferAction = '';
  groupData: any;

  canEdit: boolean = true;

  // Variable for lastPostId
  lastFileId: string;

  workspaceId: string;

  authToken: string;

  customFields: any = [];

  sortingBit: String = 'none';
  sortingData: any;

  filteringBit: String = 'none'
  filteringData: any;

  shareDBSocket;

  // More to load maintains check if we have more to load members on scroll
  public moreToLoad: boolean = true;

  isAdmin = true;

  isFilesVersionsModuleAvailable = false;

  isIndividualSubscription = true;

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector);

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  // Create subsink class to unsubscribe the observables
  public subSink = new SubSink();

  constructor(
    @Inject(LOCALE_ID) public locale: string,
    public utilityService: UtilityService,
    private injector: Injector,
    private _router: Router,
    private router: ActivatedRoute,
    private filesService: FilesService,
    private flamingoService: FlamingoService,
    private foldersService: FoldersService,
    public dialog: MatDialog,
    public storageService: StorageService,
    private groupService: GroupService,
    private managementPortalService: ManagementPortalService,
    private approvalPDFSignaturesService: ApprovalPDFSignaturesService
  ) { }

  async ngOnInit() {
    this.userData = await this.publicFunctions.getCurrentUser();
    this.groupData = await this.publicFunctions.getCurrentGroupDetails();

    this.isFilesVersionsModuleAvailable = await this.publicFunctions.isFilesVersionsModuleAvailable();
    this.isIndividualSubscription = await this.publicFunctions.checkIsIndividualSubscription();
    this.isAdmin = this.isAdminUser();

    const folderId = await this.router.snapshot.queryParamMap.has('folder') ? this.router.snapshot.queryParamMap.get('folder') : false
    if (!folderId) {
      await this.initRootFolder();
    } else {
      await this.openFolder(folderId);
    }

    if (this.groupData && this.groupData._workspace && this.groupData?._id && this.userData) {
      this.workspaceId = this.groupData._workspace;

      // Fetches the user groups from the server
      await this.publicFunctions.getAllUserGroups(this.workspaceId)
        .then((groups: any) => {

          groups.splice(groups.findIndex(group => group._id == this.groupData?._id), 1);

          this.userGroups = groups;

          this.userGroups.sort((g1, g2) => (g1.group_name > g2.group_name) ? 1 : -1);
          this.utilityService.removeDuplicates(this.userGroups, '_id').then((groups)=>{
            this.userGroups = groups;
          });
        })
        .catch(() => {
          // If the function breaks, then catch the error and console to the application
          this.publicFunctions.sendError(new Error($localize`:@@groupFiles.unableToConnectToServer:Unable to connect to the server, please try again later!`));
        });
    }

    this.authToken = `Bearer ${this.storageService.getLocalData('authToken')['token']}`;

    /**
     * Obtain the custom fields
     */
     this.customFields = [];
     await this.groupService.getGroupFilesCustomFields(this.groupData?._id).then((res) => {
       if (res && res['group']['files_custom_fields']) {
         res['group']['files_custom_fields'].forEach(field => {
           this.customFields.push(field);
         });
       }
     });

     if (this._router.routerState.snapshot.root.queryParamMap.has('itemId')) {
       const itemId = this._router.routerState.snapshot.root.queryParamMap.get('itemId');
       const file = await this.publicFunctions.getFile(itemId);
       this.openFileDetailsDialog(file);
     }
  }

  ngAfterViewInit(){
    this.subSink.add(this.queryChanged
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(async (res)=>{
        this.files = await this.publicFunctions.searchFiles(this.groupData?._id, res, this.workspaceId);
        this.files = await this.filterRAGFiles(this.files);
      }));
  }

  /**
   * Unsubscribe all the observables on destroying the component
   */
  ngOnDestroy() {
    this.subSink.unsubscribe()
    this.isLoading$.complete()
  }

  async getFile(file: any) {
    file.canEdit = true;
    file.canView = true;
    file.canDelete = true;
    this.files.unshift(file);
  }

  getFolder(folder: any) {
    folder.canEdit = true;
    folder.canView = true;
    folder.canDelete = true;
    this.folders.unshift(folder);
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

      let files: any = await this.publicFunctions.getFiles(this.groupData?._id, this.lastFileId);
      files = await this.filterRAGFiles(files);

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
          this.utilityService.asyncNotification($localize`:@@groupFiles.pleaseWaitDeleting:Please wait, we are deleting...`, new Promise((resolve, reject) => {
            if (type == 'file' || type == 'folio' || type == 'flamingo' || type == 'campaign') {
              this.filesService.deleteFile(itemId, fileName, this.workspaceId, type == 'flamingo')
                .then((res) => {
                  // Emit the Deleted file to all the components in order to update the UI
                  this.delete.emit(res['file']);

                  // Remove the file from the list
                  this.files = this.files.filter(file => file._id !== itemId);

                  resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupFiles.fileDeleted:File deleted!`));
                }).catch((err) => {
                  reject(this.utilityService.rejectAsyncPromise($localize`:@@groupFiles.unableToDeleteFile:Unable to delete file, please try again!`));
                });
            } else {
              this.foldersService.deleteFolder(itemId)
                .then((res) => {
                  // Emit the Deleted folder to all the components in order to update the UI
                  this.delete.emit(res['folder']);

                  // Remove the folder from the list
                  this.folders = this.folders.filter(folder => folder._id !== itemId);

                  resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupFiles.folderDeleted:Folder deleted!`));
                }).catch((err) => {
                  reject(this.utilityService.rejectAsyncPromise($localize`:@@groupFiles.unableToDeleteFolder:Unable to delete folder, please try again!`));
                });
            }
          }));
        }
      });
  }

  // async openViewFileDialog(file: any) {
  //   const dialogRef = this.dialog.open(PreviewFilesDialogComponent, {
  //     width: '90%',
  //     height: '90%',
  //     data: {
  //       modified_name: file?.modified_name,
  //       fileId: file?._id,
  //       workspaceId: this.workspaceId,
  //       authToken: this.authToken
  //     }
  //   });
  // }

  openViewFolioDialog(folioId: string) {
    const dialogRef = this.dialog.open(PreviewFilesDialogComponent, {
      width: '90%',
      height: '90%',
      data: {
        id: folioId,
        group: this.groupData?._id
      }
    });
  }

  async copyFolderLinkToClipboard(folder: any) {
    // Create Selection Box
    let selBox = document.createElement('textarea');

    // Set the CSS Properties
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';

    let url = this.clientUrl;
    if (environment.production) {
      url += '/' + this.locale;
    }
    const currentFolderId = await this.router.snapshot.queryParamMap.has('folder') ? this.router.snapshot.queryParamMap.get('folder') : false;
    if (!currentFolderId) {
      url += this._router.url + '?folder=' + folder?._id;
    } else {
      let urlSplit = this._router.url.split('?folder=');
      url += urlSplit[0] + '?folder=' + folder?._id;
    }

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
    this.utilityService.simpleNotification($localize`:@@groupFiles.copiedToClipboard:Copied to Clipboard!`);
  }

  /**
   * This function is responsible for copying the folio link to the clipboard
   */
  async copyToClipboard(file: any) {
    // Create Selection Box
    let selBox = document.createElement('textarea');

    // Set the CSS Properties
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';

    let url = await this.publicFunctions.getFileUrl(file, this.workspaceId);
    // let url = this.clientUrl;
    // if (environment.production) {
    //   url += '/' + this.locale;
    // }
    // if (file?.type == 'folio') {
    //   url += '/document/' + file?._id + '?readOnly=true';
    // } else if (file?.type == 'flamingo') {
    //   url += '/document/flamingo/' + file?._id;
    // } else if (file?.type == 'file') {
    //   const lastFileVersion: any = await this.utilityService.getFileLastVersion(file?._id);
    //   if (this.isOfficeFile(lastFileVersion?.original_name)) {
    //     url = await this.getLibreOfficeURL(lastFileVersion);
    //   } else {
    //     // url = this.filesBaseUrl + '/' + file?.modified_name + '?authToken=' + this.authToken;
    //     await this.filesService.getMinioFile(file?._id, file?.modified_name, this.workspaceId, this.authToken).then(async res =>{
    //       url = res['url'];
    //     });
    //   }
    // }

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
    this.utilityService.simpleNotification($localize`:@@groupFiles.copiedToClipboard:Copied to Clipboard!`);
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
    this.utilityService.getConfirmDialogAlert($localize`:@@groupFiles.areYouSure:Are you sure?`, $localize`:@@groupFiles.doingThisItemWillBeCopied:By doing this the item will be copied to the selected group!`)
      .then(async (res) => {
        if (res.value) {
          await this.utilityService.asyncNotification($localize`:@@groupFiles.pleaseWaitCopyingFolio:Please wait, we are copying the Folio...`, new Promise((resolve, reject) => {
            this.filesService.transferToGroup(itemId, group, true).then((res) => {
                resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupFiles.folioCopied:👍 Folio Copied!`));
              })
              .catch((error) => {
                reject(this.utilityService.rejectAsyncPromise($localize`:@@groupFiles.errorCopyingFolio:Error while copying the Folio!`));
              });
          }));
        }
      });
  }

  async moveToGroup(itemId: string, groupId: string, type: string) {
    // Open the Confirm Dialog to ask for permission
    this.utilityService.getConfirmDialogAlert($localize`:@@groupFiles.areYouSure:Are you sure?`, $localize`:@@groupFiles.doingThisItemWillBeMoved:By doing this the item will be moved to the selected group!`)
      .then(async (res) => {
        if (res.value) {
          await this.utilityService.asyncNotification($localize`:@@groupFiles.pleaseWaitMovingFolio:Please wait we are moving the item...`, new Promise((resolve, reject) => {
            this.filesService.transferToGroup(itemId, groupId, false)
              .then(async (res) => {
                const newGroup = await this.publicFunctions.getGroupDetails(groupId);
                await this.publicFunctions.sendUpdatesToGroupData(newGroup);
                // Redirect to the new group files page
                this._router.navigate(['/dashboard', 'work', 'groups', 'files']);
                resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupFiles.folioMoved:👍 Folio Moved!`));
              })
              .catch((error) => {
                reject(this.utilityService.rejectAsyncPromise($localize`:@@groupFiles.errorMovingFolio:Error while moving the folio!`));
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
      await this.foldersService.getOne(folderId)
        .then(async res => {
          this.currentFolder = res['folder'];
          if (this.currentFolder?._group?._id != this.groupData._id) {
            this.groupData = await this.publicFunctions.changeCurrentGroupDetails(this.currentFolder?._group?._id)
          }

          this.currentFolder.canEdit = this.utilityService.canUserDoFileAction(this.currentFolder, this.groupData, this.userData, 'edit');
          this.folderOriginalName = this.currentFolder.folder_name;
        });

      // Fetch the uploaded files from the server
      this.folders = await this.publicFunctions.getFolders(this.groupData?._id, folderId);
      const parentFolder = {
        _id: this.currentFolder?._parent || 'root',
        folder_name: '../',
        type: undefined
      }
      this.folders.unshift(parentFolder);

      await this.initFolders();

      // Fetch the uploaded files from the server
      this.files = await this.publicFunctions.getFiles(this.groupData?._id, folderId);

      // Set the lastFileId for scroll
      this.lastFileId = this.files[this.files.length - 1]?._id;

      this.files = await this.filterRAGFiles(this.files);
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
        this.utilityService.resolveAsyncPromise($localize`:@@groupFiles.changeFolderTitle:Folder Title Changed!`);
      })
      .catch((error) => {
        this.utilityService.rejectAsyncPromise($localize`:@@groupFiles.errorChangingFolderTitle:Error while changing the title of the folder!`);
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
    this.folders = await this.publicFunctions.getFolders(this.groupData?._id);

    await this.initFolders();

    // Fetch the uploaded files from the server
    this.files = await this.publicFunctions.getFiles(this.groupData?._id, null);

    if (this.files) {
      // Set the lastFileId for scroll
      this.lastFileId = this.files[this.files.length - 1]?._id;
    }

    this.files = await this.filterRAGFiles(this.files);

    this.currentFolder = null;
  }

  /**
   * This function is used to return the mime type icon based on the extension of the fileName
   * @param fileName - Name of the file to obtain the icon img
   */
  getFileIcon(fileName: string) {
    return "assets/images/" + this.getFileExtension(fileName) + "-file-icon.png";
  }

  getFileExtension(fileName: string) {
    let fileType = '';
    if (fileName) {
      let file = fileName?.split(".");
      fileType = file[file.length-1].toLowerCase();
      if (fileType == 'mp4') {
        fileType = 'mov';
      }
    }
    
    return fileType;
  }

  isOfficeFile(fileName: string) {
    const officeExtensions = ['ott', 'odm', 'doc', 'docx', 'xls', 'xlsx', 'ods', 'ots', 'odt', 'xst', 'odg', 'otg', 'odp', 'ppt', 'pptx', 'otp', 'pot', 'odf', 'odc', 'odb'];
    const fileExtension = this.getFileExtension(fileName);
    return officeExtensions.includes(fileExtension);
  }

  /**
   * Methods for Drop files to upload
   */
  /**
   * This function is responsible for uploading the files to the server
   * @param files
   */
   fileDropped(files: FileList) {
    if (!this.groupData?.files_for_admins || this.isAdmin) {
      // Loop through each file and begin the process of uploading
      Array.prototype.forEach.call(files, (file: File) => {
        let fileData = {
          _group: this.groupData?._id,
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
    } else {
      this.utilityService.infoNotification($localize`:@@groupFiles.noAuthorize:You are not authorized to upload files in this group!`);
    }
  }

  /**
   * This function is responsible for uploading a file to the server
   * @param fileData
   * @param file
   */
  uploadFile(fileData: any, file?: File) {
    // Call the HTTP Request Asynschronously
    this.utilityService.asyncNotification(
      (file) ? $localize`:@@groupFiles.pleaseWaitUploadingFile:Please wait, we are uploading your file - ${file['name']} ...` : $localize`:@@groupFiles.pleaseWaitCreatingFolio:Please wait while we are creating a new folio`,
      new Promise((resolve, reject) => {
        this.filesService.addFile(fileData, this.workspaceId, this.groupData?._id, (this.currentFolder) ? this.currentFolder._id : null, file)
          .then((res) => {

            // Output the created file to the top components
            this.getFile(res['file']);
            resolve((file) ? this.utilityService.resolveAsyncPromise($localize`:@@groupFiles.fileUploaded:File has been uploaded!`) :
              this.utilityService.resolveAsyncPromise($localize`:@@groupFiles.newFileUploaded:New file has been uploaded!`))

          })
          .catch(() => {
            reject(this.utilityService.rejectAsyncPromise($localize`:@@groupFiles.unexpectedErrorUploading:Unexpected error occurred while uploading, please try again!`))
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
          this.utilityService.asyncNotification($localize`:@@groupFiles.pleaseWaitMovingItem:Please wait, we are moving the item...`, new Promise((resolve, reject) => {
            if (type == 'file') {
              this.filesService.moveToFolder(itemId, folderId)
                .then((res) => {
                  // Remove the file from the list
                  this.files = this.files.filter(file => file._id !== itemId);

                  resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupFiles.fileMoved:File moved!`));
                }).catch((err) => {
                  reject(this.utilityService.rejectAsyncPromise($localize`:@@groupFiles.unableToMoveFile:Unable to move the file, please try again!`));
                });
            } else if (type == 'folder') {
              this.foldersService.moveToFolder(itemId, folderId)
                .then((res) => {
                  // Remove the file from the list
                  this.folders = this.folders.filter(folder => folder._id !== itemId);

                  resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupFiles.folderMoved:👍 Folder moved!`));
                }).catch((err) => {
                  reject(this.utilityService.rejectAsyncPromise($localize`:@@groupFiles.unableToMoveFolder:Unable to move the folder, please try again!`));
                });
            }
          }));
        }
      });
  }

  async copyFlamingo(fileId: string) {
    this.utilityService.asyncNotification($localize`:@@groupFiles.pleaseWaitDuplicateFile:Please wait, we are duplicating the file...`, new Promise((resolve, reject) => {
        this.flamingoService.copyFlamingo(fileId)
          .then((res) => {

            this.getFile(res['file']);

            resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupFiles.flamingoDuplicated:Flamingo duplicated!`));
          }).catch((err) => {
            reject(this.utilityService.rejectAsyncPromise($localize`:@@groupFiles.unableToDuplicateFlamingo:Unable to duplicate the flamingo, please try again!`));
          });
    }));
  }

  async initFolders() {
    if (this.groupData.enabled_rights) {
      await this.filterRAGFolders();
    } else {
      this.folders.forEach(async folder => {
        folder.canEdit = true;
        folder.canDelete = await this.utilityService.canUserDoFileAction(folder, this.groupData, this.userData, 'delete');
      });
    }
  }

  filterRAGFolders() {
    let foldersTmp = [];
    this.folders.forEach(async folder => {
        folder.canDelete = await this.utilityService.canUserDoFileAction(folder, this.groupData, this.userData, 'delete');
        const canEdit = await this.utilityService.canUserDoFileAction(folder, this.groupData, this.userData, 'edit') && (!this.groupData?.files_for_admins || this.isAdmin);
        let canView = false;

        if (!canEdit) {
          const hide = await this.utilityService.canUserDoFileAction(folder, this.groupData, this.userData, 'hide');
          canView = await this.utilityService.canUserDoFileAction(folder, this.groupData, this.userData, 'view') || !hide;
        }

        folder.canEdit = canEdit;
        if (canEdit || canView) {
          foldersTmp.push(folder);
        }
    });
    this.folders = foldersTmp;
  }

  filterRAGFiles(files: any) {
    let filesTmp = [];
    files.forEach(async file => {
        file.canDelete = await this.utilityService.canUserDoFileAction(file, this.groupData, this.userData, 'delete');
        let canEdit = await this.utilityService.canUserDoFileAction(file, this.groupData, this.userData, 'edit') && (!this.groupData?.files_for_admins || this.isAdmin);
        let canView = false;
        if (!canEdit) {
          const hide = await this.utilityService.canUserDoFileAction(file, this.groupData, this.userData, 'hide');
          canView = await this.utilityService.canUserDoFileAction(file, this.groupData, this.userData, 'view') || !hide;
        }

        file.canEdit = canEdit;
        if (canEdit || canView) {
          filesTmp.push(file);
        }
    });
    return filesTmp;
  }

  /**
   * This function is responsible for opening a dialog to edit permissions
   */
  openPermissionModal(item: any, type: string): void {
    const dialogRef = this.utilityService.openPermissionModal(item, this.groupData, this.userData, type);

    if (dialogRef) {
      const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe((data) => {
      });

      dialogRef.afterClosed().subscribe(result => {
        closeEventSubs.unsubscribe();
      });
    }
  }

  openFileDetailsDialog(file: any) {
    const dialogRef = this.dialog.open(FileDetailsDialogComponent, {
      width: '100%',
      height: '100%',
      disableClose: true,
      hasBackdrop: true,
      data: {
        fileData: file,
        groupData: this.groupData,
        userData: this.userData,
        isFilesVersionsModuleAvailable: this.isFilesVersionsModuleAvailable
      }
    });

    if (dialogRef) {
      const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe((data) => {
        file = data;
        const index = (this.files) ? this.files.findIndex(file => file._id == data._id) : -1;
        if (index >= 0) {
          this.files[index] = data;
        }
      });

      const newVersionEventSubs = dialogRef.componentInstance.newVersionEvent.subscribe((data) => {
        const index = (this.files) ? this.files.findIndex(f => f._id == (data?._parent?._id || data?._parent)) : -1;
        this.files[index].modified_name = data.modified_name
      });

      const allVersionsDeletedEventSubs = dialogRef.componentInstance.allVersionsDeletedEmitter.subscribe((data) => {
        this.files = this.files.filter(file => file._id !== data);
      });

      dialogRef.afterClosed().subscribe(result => {
        closeEventSubs.unsubscribe();
        allVersionsDeletedEventSubs.unsubscribe();
        newVersionEventSubs.unsubscribe();
      });
    }
  }

  async onCustomFieldEmitter(customFields) {
    this.customFields = [...customFields];
  }

  isAdminUser() {
    const index = (this.groupData && this.groupData._admins) ? this.groupData._admins.findIndex((admin: any) => admin._id === this.userData._id) : -1;
    return index >= 0 || this.userData.role == 'owner';
  }

  async onSortEmitter(sort: any) {
    // Start the loading spinner
    this.isLoading$.next(true);

    this.sortingBit = sort.bit;
    this.sortingData = sort.data;

    await this.sorting();

    // Stop the loading spinner
    this.isLoading$.next(false);
  }

  async onFilterEmitter(filter: any) {
    // Start the loading spinner
    this.isLoading$.next(true);

    let files: any = await this.publicFunctions.getFilteredFiles(this.groupData?._id, (this.currentFolder?._id || ''), filter.bit, filter.data);
    this.files = await this.filterRAGFiles(files);

    if (this.sortingBit && this.sortingBit != '') {
      await this.sorting();
    }

    // Stop the loading spinner
    this.isLoading$.next(false);
  }

  async sorting() {
    if (this.sortingBit == 'created_date' || this.sortingBit == 'none') {
      this.folders.sort((t1, t2) => {
        if (t1.created_date && t2.created_date) {
          if (this.utilityService.isBefore(DateTime.fromISO(t1.created_date), DateTime.fromISO(t2.created_date))) {
            return this.sortingBit == 'created_date' ? -1 : 1;
          } else {
            return this.sortingBit == 'created_date' ? 1 : -1;
          }
        } else {
          if (t1.created_date && !t2.created_date) {
            return -1;
          } else if (!t1.created_date && t2.created_date) {
            return 1;
          }
        }
      });
      this.files.sort((t1, t2) => {
        if (t1.created_date && t2.created_date) {
          if (this.utilityService.isBefore(DateTime.fromISO(t1.created_date), DateTime.fromISO(t2.created_date))) {
            return this.sortingBit == 'created_date' ? -1 : 1;
          } else {
            return this.sortingBit == 'created_date' ? 1 : -1;
          }
        } else {
          if (t1.created_date && !t2.created_date) {
            return -1;
          } else if (!t1.created_date && t2.created_date) {
            return 1;
          }
        }
      });
    } else if (this.sortingBit == 'custom_field') {
      this.files.sort((t1, t2) => {
        if (this.sortingData?.input_type_date) {
          return (t1?.custom_fields && t2?.custom_fields)
            ? (t1?.custom_fields[this.sortingData.name] && t2?.custom_fields[this.sortingData.name])
              ?((this.utilityService.isBefore(DateTime.fromISO(t1?.custom_fields[this.sortingData.name]), DateTime.fromISO(t2?.custom_fields[this.sortingData.name])))
                ? -1 : (this.utilityService.isBefore(DateTime.fromISO(t2?.custom_fields[this.sortingData.name]), DateTime.fromISO(t1?.custom_fields[this.sortingData.name])))
                  ? 1 : 0)
              : ((t1?.custom_fields[this.sortingData.name] && !t2?.custom_fields[this.sortingData.name])
                ? -1 : ((!t1?.custom_fields[this.sortingData.name] && t2?.custom_fields[this.sortingData.name]))
                  ? 1 : 0)
            : ((t1?.custom_fields && !t2?.custom_fields)
              ? -1 : ((!t1?.custom_fields && t2?.custom_fields))
                ? 1 : 0);
        } else {
          return (t1?.custom_fields && t2?.custom_fields)
            ? (t1?.custom_fields[this.sortingData.name] && t2?.custom_fields[this.sortingData.name])
              ?((t1?.custom_fields[this.sortingData.name] > t2?.custom_fields[this.sortingData.name])
                ? -1 : (t1?.custom_fields[this.sortingData.name] < t2?.custom_fields[this.sortingData.name])
                  ? 1 : 0)
              : ((t1?.custom_fields[this.sortingData.name] && !t2?.custom_fields[this.sortingData.name])
                ? -1 : ((!t1?.custom_fields[this.sortingData.name] && t2?.custom_fields[this.sortingData.name]))
                  ? 1 : 0)
            : ((t1?.custom_fields && !t2?.custom_fields)
              ? -1 : ((!t1?.custom_fields && t2?.custom_fields))
                ? 1 : 0);
        }
      });
    } else if (this.sortingBit == 'name') {
      this.folders.sort((t1, t2) => {
        const name1 = t1?.folder_name?.toLowerCase();
        const name2 = t2?.folder_name?.toLowerCase();
        if (name1 > name2) { return 1; }
        if (name1 < name2) { return -1; }
        return 0;
      });
      this.files.sort((t1, t2) => {
        const name1 = t1?.original_name?.toLowerCase();
        const name2 = t2?.original_name?.toLowerCase();
        if (name1 > name2) { return 1; }
        if (name1 < name2) { return -1; }
        return 0;
      });
    } else if (this.sortingBit == 'tags') {
      this.files.sort((t1, t2) => {
        if (t1?.tags && t1?.tags.length > 0 && t2?.tags && t2?.tags.length > 0) {
          const name1 = t1?.tags[0]?.toLowerCase();
          const name2 = t2?.tags[0]?.toLowerCase();
          if (name1 > name2) { return 1; }
          if (name1 < name2) { return -1; }
          return 0;
        } else {
          if ((t1?.tags && t1?.tags.length > 0) && (!t2?.tags || t2?.tags.length == 0)) {
            return -1;
          } else if ((!t1?.tags || t1?.tags.length == 0) && (t2?.tags && t2?.tags.length > 0)) {
            return 1;
          }
        }
      });
    } else if (this.sortingBit == 'reverse' || this.sortingBit == 'inverse') {
      this.files.reverse();
    }
  }

  async exportToPDF(fileData: any) {
    this.isLoading$.next(true);

    switch (fileData.type) {
      case 'file':
        if (fileData.mime_type.includes('pdf')) {
          this.modifyPdf(fileData);
        }
        break;
      case 'folio':
        this.modifyFolio(fileData);
        break;
      //case 'campaign':
      //  break;
      default:
        break;
    }
  }

  async modifyPdf(fileData: any) {
    const token = this.storageService.getLocalData('authToken')['token'];
    // const url = this.filesBaseUrl + '/' + fileData?.modified_name + '?authToken=Bearer ' + token;
    // const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());
    // const pdfDoc = await PDFDocument.load(existingPdfBytes);
    this.filesService.getMinioFile(fileData?._id, fileData?.modified_name, this.workspaceId, this.authToken).then(async res =>{
      const pdfDoc = await PDFDocument.load(res['url']);

      let pdfBytes;
      if (fileData
          && fileData.approval_active && fileData.approval_flow_launched
          && fileData.approval_flow && fileData.approval_flow.length > 0) {
        pdfBytes = await this.approvalPDFSignaturesService.addSignaturePage(fileData, pdfDoc, token);
      } else {
        pdfBytes = await pdfDoc.save();
      }

      saveAs(new Blob([pdfBytes], { type: "application/pdf" }), fileData?.original_name);

      this.isLoading$.next(false);
    });
  }

  async modifyFolio(fileData: any) {
    const folio = await this.initializeConnection(fileData._id);

    folio.subscribe(async () => {
      const quillElement = document.createElement("quillElement");
      const quillInstance = new Quill(quillElement);
      quillInstance.setContents(folio?.data?.data?.delta);
      const blob = await pdfExporter.generatePdf(quillInstance.getContents());
      const pdfDoc = await PDFDocument.load(await blob.arrayBuffer());

      if (fileData
          && fileData.approval_active && fileData.approval_flow_launched
          && fileData.approval_flow && fileData.approval_flow.length > 0) {
        const pdfBytes = await this.approvalPDFSignaturesService.addSignaturePage(fileData, pdfDoc, this.storageService.getLocalData('authToken')['token']);
        saveAs(new Blob([pdfBytes], { type: "application/pdf" }), fileData?.original_name);
      } else {
        saveAs(blob as Blob, fileData?.original_name + ".pdf");
      }

      this.shareDBSocket?.close();
    });

    this.isLoading$.next(false);
  }

  // TODO - FIND A SOLUTION TO OBTAIN THE FOLIO DATA FROM DB WITHOUT SOCKET
  initializeConnection(folioId: string) {
    // Connect with the Socket Backend
    this.shareDBSocket = new ReconnectingWebSocket(environment.FOLIO_BASE_URL + "/editor", [], {});

    // Initialise the Realtime DB Connection
    let shareDBConnection = new ShareDB.Connection(this.shareDBSocket);

    // Return the Document with the respective folioId
    return shareDBConnection.get("documents", folioId);
  }

  async openOfficeDoc(file: any) {
    // Start the loading spinner
    this.isLoading$.next(true);

    if (this.isFilesVersionsModuleAvailable) {
      const lastFileVersion: any = await this.utilityService.getFileLastVersion(file?._id);
      if (this.isOfficeFile(lastFileVersion?.original_name)) {
        window.open(await this.publicFunctions.getLibreOfficeURL(lastFileVersion?._id, this.workspaceId), "_blank");
      } else {
        // window.open(this.filesBaseUrl + '/' + lastFileVersion?.modified_name + '?authToken=' + this.authToken, "_blank");
        this.filesService.getMinioFile(lastFileVersion?._id, lastFileVersion?.modified_name, this.workspaceId, this.authToken).then(res =>{
          window.open(res['url'], "_blank");
        });
      }
    } else {
      window.open(await this.publicFunctions.getLibreOfficeURL(file?._id, this.workspaceId), "_blank");
    }

    this.isLoading$.next(false);
  }

  openFullscreenModal(userId: string) {
    this.utilityService.openMeberBusinessCard(userId);
  }

  async openDocument(file: any) {
    // Start the loading spinner
    this.utilityService.updateIsLoadingSpinnerSource(true);

    if (this.isFilesVersionsModuleAvailable) {
      const lastFileVersion: any = await this.utilityService.getFileLastVersion(file?._id);
      if (this.isOfficeFile(lastFileVersion?.original_name)) {
        window.open(await this.publicFunctions.getLibreOfficeURL(lastFileVersion?._id, this.workspaceId), "_blank");
      } else {
        this.filesService.getMinioFile(lastFileVersion?._id, lastFileVersion?.modified_name, this.workspaceId, this.authToken).then(res =>{
          window.open(res['url'], "_blank");
        });
      }
    } else {
      this.filesService.getMinioFile(file?._id, file?.modified_name, this.workspaceId, this.authToken).then(res =>{
        window.open(res['url'], "_blank");
      });
    }

    // Stop the loading spinner
    this.utilityService.updateIsLoadingSpinnerSource(false);
  }

  async downloadDocument(file: any) {
    // Start the loading spinner
    this.utilityService.updateIsLoadingSpinnerSource(true);
    let fileVersion = file;
    if (this.isFilesVersionsModuleAvailable) {
      fileVersion = await this.utilityService.getFileLastVersion(file?._id);
    }

    if (!!fileVersion) {
      this.filesService.getMinioFile(fileVersion?._id, fileVersion?.modified_name, this.workspaceId, this.authToken).then(res =>{
        window.open(res['url'], "_blank");
      });
    }

    // Stop the loading spinner
    this.utilityService.updateIsLoadingSpinnerSource(false);
  }

  /**
   * This function is responsible for uploading the files to the server
   * @param files
   */
   uploadNewVersion(files: FileList, file: any) {
    // Start the loading spinner
    this.utilityService.updateIsLoadingSpinnerSource(true);

    const parentFileId = (file._parent) ? file._parent._id : file._id;

    // File Data variable
    const fileData: any = {
      _group: this.groupData?._id,
      _posted_by: this.userData?._id,
      type: 'file',
      _parent: parentFileId
    }

    // Loop through each file and begin the process of uploading
    Array.prototype.forEach.call(files, (uploadFile: File) => {
      // Adding Mime Type of the file uploaded
      fileData.mime_type = uploadFile.type

      // Call the HTTP Request Asynschronously
      this.utilityService.asyncNotification($localize`:@@groupFiles.pleaseWaitUploadingNewVersion:Please wait we are uploading your new version...`,
        new Promise((resolve, reject) => {
          this.filesService.addFile(fileData, this.workspaceId, this.groupData?._id, (this.currentFolder) ? this.currentFolder._id : null, uploadFile)
            .then((res) => {
              const index = (this.files) ? this.files.findIndex(f => f._id == file?._id) : -1;
              this.files[index].modified_name = res['file'].modified_name
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupFiles.fileUploaded:File has been uploaded!`))
            })
            .catch(() => {
              reject(this.utilityService.rejectAsyncPromise($localize`:@@groupFiles.unexpectedErrorUploading:Unexpected error occurred while uploading, please try again!`))
            });
        }));
    });

    // Stop the loading spinner
    this.utilityService.updateIsLoadingSpinnerSource(false);
  }
}
