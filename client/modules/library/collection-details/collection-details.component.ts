import { Component, OnInit, Injector } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { MatDialog } from '@angular/material/dialog';
import { LibraryService } from 'src/shared/services/library-service/library.service';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { FilesService } from 'src/shared/services/files-service/files.service';
import { environment } from 'src/environments/environment';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { FoldersService } from 'src/shared/services/folders-service/folders.service';

@Component({
  selector: 'app-collection-details',
  templateUrl: './collection-details.component.html',
  styleUrls: ['./collection-details.component.scss']
})
export class CollectionDetailsComponent implements OnInit {

  collectionId: string;

  collectionData: any;
  userData: any;
  groupData: any;
  workspaceData: any;

  authToken: string;

  pagesLabel = $localize`:@@collectionDetails.general:Pages`;
  filesLabel = $localize`:@@collectionDetails.workload:Files`;
  newPageName = $localize`:@@collectionDetails.newPage:New Page`;

  // File Data variable
  fileData: any = {
    _group: '',
    _folder: '',
    _posted_by: '',
    type: 'file'
  };

  files: any = [];
  folders: any = [];
  folderId;

  currentFolder = null;
  folderOriginalName = '';
  editFolderTitle = false;

  canEdit = false;

  baseAPIUrl = environment.UTILITIES_BASE_API_URL;

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public injector: Injector,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    private _router: Router,
    private utilityService: UtilityService,
    public storageService: StorageService,
    private filesService: FilesService,
    private libraryService: LibraryService,
    private foldersService: FoldersService,
    private workspaceService: WorkspaceService
  ) {
    this.collectionId = this.activatedRoute.snapshot.queryParams['collection'];

    if (!this.collectionId) {
      this._router.navigate(['/dashboard/work/groups/library']);
    }
  }

  async ngOnInit() {

    // Starts the spinner
    this.isLoading$.next(true);

    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'collection'
    });

    await this.libraryService.getCollection(this.collectionId).then(res => {
      this.collectionData = res['collection']
    });

    const isAuth = this.storageService.existData('authToken');

    // Fetch the current loggedIn user data
    if (!this.objectExists(this.userData) && !!isAuth) {
      this.userData = await this.publicFunctions.getCurrentUser();
    }

    this.authToken = `Bearer ${this.storageService.getLocalData('authToken')['token']}`;

    if (!this.objectExists(this.groupData) && !!isAuth) {
      // Fetch the current group data
      this.groupData = await this.publicFunctions.getCurrentGroupDetails();
    } else if (!this.objectExists(this.groupData)) {
      await this.libraryService.getGroupByCollection(this.collectionId).then(res => {
        this.groupData = res['group'];
      });
    }

    if (!this.objectExists(this.workspaceData) && !!isAuth) {
      // Fetch the current workspace data
      this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    } else if (!this.objectExists(this.workspaceData)) {
      await this.libraryService.getWorkspaceByCollection(this.collectionId).then(res => {
        this.workspaceData = res['workspace'];
      });
    }

    this.canEdit = await this.utilityService.canUserDoCollectionAction(this.collectionData, this.groupData, 'edit', !!isAuth, this.userData);

    this.initPages();

    await this.initRootFolder();

    if (this.objectExists(this.workspaceData) && this.objectExists(this.groupData)) {
      // Set the File Credentials after view initialization
      this.fileData = {
        _group: this.groupData?._id,
        _collection: this.collectionData?._id,
        _folder: (!!this.currentFolder) ? this.currentFolder._id : null,
        type: 'file',
        _workspace: this.workspaceData?._id
      }
    }

    // Stops the spinner and return the value with ngOnInit
    this.isLoading$.next(false);
  }

  ngOnDestroy() {
    this.isLoading$.complete();
  }

  async initPages() {
    await this.libraryService.getPageByCollection(this.collectionData?._id).then(res => {
			this.collectionData._pages = res['pages'];
		});
  }

  async createPage(parentPageId?: string) {
    await this.utilityService.asyncNotification($localize`:@@collectionDetails.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise(async (resolve, reject) => {

      this.libraryService.createPage(this.collectionData?._id, parentPageId, this.newPageName).then(res => {
        if (!this.collectionData._pages) {
          this.collectionData._pages = [];
        }
        this.collectionData._pages.push(res['page']);

        // Resolve with success
        resolve(this.utilityService.resolveAsyncPromise($localize`:@@collectionDetails.pageCreated:Page created!`));
      })
      .catch(() => {
        reject(this.utilityService.rejectAsyncPromise($localize`:@@collectionDetails.unableToCreate:Unable to create the page, please try again!`));
      });
    }));
  }
  
  // fileDropped(files: FileList) {
  //     // Loop through each file and begin the process of uploading
  //     Array.prototype.forEach.call(files, (file: File) => {
  //       let fileData = {
  //         _group: this.groupData?._id,
  //         _collection: this.collectionData?._id,
  //         _posted_by: this.userData._id,
  //         type: 'file',
  //         mime_type: '',
  //         _workspace: this.workspaceData._id
  //       }
  //       // Adding Mime Type of the file uploaded
  //       fileData.mime_type = file.type

  //       // Call the Upload file service function
  //       this.uploadFile(fileData, file);
  //     });
  // }

  /**
   * This function is responsible for uploading the files to the server
   * @param files
   */
  fileInput(files: FileList, type?: any) {
    // Start the loading spinner
    this.isLoading$.next(true);

    // Loop through each file and begin the process of uploading
    Array.prototype.forEach.call(files, (file: File) => {

      // Adding Mime Type of the file uploaded
      this.fileData.mime_type = file.type

      // Change type of file, if input is a flamingo
      if(type){
        this.fileData.type = type
      }

      this.fileData._folder = (!!this.currentFolder) ? this.currentFolder._id : null;

      // Call the Upload file service function
      this.uploadFile(this.fileData, file);

    });

    // Stop the loading spinner
    this.isLoading$.next(false);
  }

  createFolder() {
    // Start the loading spinner
    this.isLoading$.next(true);

    // Files Service Instance
    let folderService = this.injector.get(FoldersService);

    // Utility Service Instance
    let utilityService = this.injector.get(UtilityService);

    const folder: any = {
      folder_name: $localize`:@@groupNewFile.newFolder:New Folder`,
      _created_by: this.userData._id,
      _group: this.groupData?._id,
      _collection: this.collectionData?._id,
      _parent: this.folderId
    };

    // Call the HTTP Request Asynschronously
    utilityService.asyncNotification(
      $localize`:@@groupNewFile.pleaseCreatingFolder:Please wait we are creating the folder - ${folder['folder_name']} ...`,
      new Promise((resolve, reject) => {
        folderService.add(folder)
          .then((res) => {
            folder._id = res['folder']._id;
            this.folders.unshift(folder);

            resolve(utilityService.resolveAsyncPromise($localize`:@@groupNewFile.folderCreated:Folder has been created!`));

          })
          .catch(() => {
            reject(utilityService.rejectAsyncPromise($localize`:@@groupNewFile.unexpectedErrorCreatingFolder:Unexpected error occurred while creating the folder, please try again!`))
          });
      }));

    // Stop the loading spinner
    this.isLoading$.next(false);
  }

  /**
   * This function is responsible for uploading a file to the server
   * @param fileData
   * @param file
   */
  uploadFile(fileData: any, file: File) {
    // Call the HTTP Request Asynschronously
    this.utilityService.asyncNotification($localize`:@@pageDetails.pleaseWaitUploadingFile:Please wait we are uploading your file - ${file['name']} ...`,
      new Promise((resolve, reject) => {
        this.libraryService.addCollectionFile(this.collectionData?._id, this.workspaceData?._id, fileData, file)
          .then((res) => {

            // Output the created file to the top components
            this.getFile(res['file']);

            resolve(this.utilityService.resolveAsyncPromise($localize`:@@pageDetails.fileUploaded:File has been uploaded!`));

          })
          .catch(() => {
            reject(this.utilityService.rejectAsyncPromise($localize`:@@pageDetails.unexpectedErrorUploading:Unexpected error occurred while uploading, please try again!`))
          })
      }))
  }

  async getFile(file: any) {
    file.canEdit = true;
    file.canView = true;
    file.canDelete = true;
    
    if (!this.collectionData._files) {
      this.collectionData._files = [];
    }

    this.collectionData._files.unshift(file);
    
    if (!this.files) {
      this.files = [];
    }

    this.files.unshift(file);
  }

  async openDocument(file: any) {
    // Start the loading spinner
    this.utilityService.updateIsLoadingSpinnerSource(true);

    if (this.isOfficeFile(file?.original_name)) {
      window.open(await this.publicFunctions.getLibreOfficeURL(file?._id, this.workspaceData?._id), "_blank");
    } else {
      this.filesService.getMinioFile(file?._id, file?.modified_name, this.workspaceData?._id, this.authToken).then(res =>{
        window.open(res['url'], "_blank");
      });
    }

    // Stop the loading spinner
    this.utilityService.updateIsLoadingSpinnerSource(false);
  }

  async downloadDocument(file: any) {
    // Start the loading spinner
    this.utilityService.updateIsLoadingSpinnerSource(true);

    if (!!file) {
      this.filesService.getMinioFile(file?._id, file?.modified_name, this.workspaceData?._id, this.authToken).then(res =>{
        window.open(res['url'], "_blank");
      });
    }

    // Stop the loading spinner
    this.utilityService.updateIsLoadingSpinnerSource(false);
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
      await this.libraryService.getFolder(folderId)
        .then(async res => {
          this.currentFolder = res['folder'];
          this.folderOriginalName = this.currentFolder.folder_name;
        });

      // Fetch the uploaded files from the server
      await this.libraryService.getFolders(this.collectionData?._id, folderId).then(res => {
        this.folders = res['folders'];
      });

      this.folders.unshift({
        _id: this.currentFolder?._parent || 'root',
        folder_name: '../',
        type: undefined
      });

      // Fetch the uploaded files from the server
      await this.libraryService.getFiles(this.collectionData?._id, folderId).then(res => {
        this.files = res['files'];
      });
    }

    // Stop the loading spinner
    this.isLoading$.next(false);
  }

  /**
   * This method is used to init the root folder in the groups files page
   */
  async initRootFolder() {
    // Fetch the uploaded files from the server
    await this.libraryService.getFolders(this.collectionData?._id).then(res => {
      this.folders = res['folders'];
    });

    // Fetch the uploaded files from the server
    await this.libraryService.getFiles(this.collectionData?._id).then(res => {
      this.files = res['files'];
    });

    this.currentFolder = null;
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
        this.utilityService.resolveAsyncPromise($localize`:@@collectionDeatils.changeFolderTitle:Folder Title Changed!`);
      })
      .catch((error) => {
        this.utilityService.rejectAsyncPromise($localize`:@@collectionDeatils.errorChangingFolderTitle:Error while changing the title of the folder!`);
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
   * Call function to delete file or a folder
   * @param itemId
   */
  deleteFile(fileId: string) {
    // Ask User to remove this file or not
    this.utilityService.getConfirmDialogAlert()
      .then((result) => {
        if (result.value) {
          // Remove the file
          this.utilityService.asyncNotification($localize`:@@collectionDeatils.pleaseWaitDeleting:Please wait, we are deleting...`, new Promise((resolve, reject) => {
            this.libraryService.deleteCollectionFile(fileId, this.workspaceData?._id)
              .then((res) => {
                // Remove the folder from the list
                this.files = this.files.filter(file => file._id !== fileId);

                resolve(this.utilityService.resolveAsyncPromise($localize`:@@collectionDeatils.fileDeleted:File deleted!`));
              }).catch((err) => {
                reject(this.utilityService.rejectAsyncPromise($localize`:@@collectionDeatils.unableToDeleteFile:Unable to delete file, please try again!`));
              });
          }));
        }
      });
  }

  /**
   * Call function to delete a folder
   * @param folderId
   */
  deleteFolder(folderId: string) {
    // Ask User to remove this file or not
    this.utilityService.getConfirmDialogAlert()
      .then((result) => {
        if (result.value) {
          // Remove the file
          this.utilityService.asyncNotification($localize`:@@groupFiles.pleaseWaitDeleting:Please wait, we are deleting...`, new Promise((resolve, reject) => {
            this.foldersService.deleteFolder(folderId)
              .then((res) => {
                // Remove the folder from the list
                this.folders = this.folders.filter(folder => folder._id !== folderId);

                resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupFiles.folderDeleted:Folder deleted!`));
              }).catch((err) => {
                reject(this.utilityService.rejectAsyncPromise($localize`:@@groupFiles.unableToDeleteFolder:Unable to delete folder, please try again!`));
              });
          }));
        }
      });
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

  objectExists(object: any) {
    return this.utilityService.objectExists(object);
  }

  getWorkspace(workspaceId: string) {
    return new Promise(async (resolve, reject) => {
        this.workspaceService.getWorkspace(workspaceId)
          .subscribe((res) => { resolve(res['workspace']) },
            (err) => {
              console.log('Error occurred while fetching the workspace details!', err);
              this.utilityService.errorNotification($localize`:@@pageDetails.errorOccuredWhileFetchingWorkspaceDetails:Error occurred while fetching the workspace details, please try again!`);
              reject(err)
          });
      });
  }
}
