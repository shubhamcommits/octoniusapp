import { Component, OnInit, Injector } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { MatDialog } from '@angular/material/dialog';
import { LibraryService } from 'src/shared/services/library-service/library.service';
import { LibreofficeService } from 'src/shared/services/libreoffice-service/libreoffice.service';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { FilesService } from 'src/shared/services/files-service/files.service';
import { environment } from 'src/environments/environment';

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
    _posted_by: '',
    type: 'file'
  };

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
    private libreofficeService: LibreofficeService,
    private libraryService: LibraryService
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

    // Fetch the current loggedIn user data
    if (!this.objectExists(this.userData)) {
      this.userData = await this.publicFunctions.getCurrentUser();
    }

    this.authToken = `Bearer ${this.storageService.getLocalData('authToken')['token']}`;

    if (!this.objectExists(this.workspaceData)) {
      // Fetch the current workspace data
      this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    }

    if (!this.objectExists(this.groupData)) {
      // Fetch the current workspace data
      this.groupData = await this.publicFunctions.getCurrentGroupDetails();
    }

    await this.libraryService.getCollection(this.collectionId).then(res => {
      this.collectionData = res['collection']
    });

    this.initPages();

    // Set the File Credentials after view initialization
    this.fileData = {
      _group: this.groupData?._id,
      _collection: this.collectionData?._id,
      type: 'file',
      _workspace: this.workspaceData?._id
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

      // Call the Upload file service function
      this.uploadFile(this.fileData, file);

    });

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
  }

  async openDocument(file: any) {
    // Start the loading spinner
    this.utilityService.updateIsLoadingSpinnerSource(true);

    if (this.isOfficeFile(file?.original_name)) {
      window.open(await this.getLibreOfficeURL(file), "_blank");
    } else {
      this.filesService.getMinioFile(file?._id, file?.modified_name, this.workspaceData?._id, this.authToken).then(res =>{
        window.open(res['url'], "_blank");
      });
    }

    // Stop the loading spinner
    this.utilityService.updateIsLoadingSpinnerSource(false);
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
                // Remove the file from the list
                this.collectionData = res['collection'];

                resolve(this.utilityService.resolveAsyncPromise($localize`:@@collectionDeatils.fileDeleted:File deleted!`));
              }).catch((err) => {
                reject(this.utilityService.rejectAsyncPromise($localize`:@@collectionDeatils.unableToDeleteFile:Unable to delete file, please try again!`));
              });
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
    const officeExtensions = ['ott', 'odm', 'doc', 'docx', 'xls', 'xlsx', 'ods', 'ots', 'odt', 'xst', 'odg', 'otg', 'odp', 'ppt', 'otp', 'pot', 'odf', 'odc', 'odb'];
    const fileExtension = this.getFileExtension(fileName);
    return officeExtensions.includes(fileExtension);
  }

  async getLibreOfficeURL(file: any) {
    // wopiClientURL = https://<WOPI client URL>:<port>/browser/<hash>/cool.html?WOPISrc=https://<WOPI host URL>/<...>/wopi/files/<id>
    let wopiClientURL = '';
    await this.libreofficeService.getLibreofficeUrl().then(res => {
        wopiClientURL = res['url'] + 'WOPISrc=' + `${this.baseAPIUrl}/libreoffice/wopi/files/${file?._id}/${this.workspaceData?._id}?access_token=${this.authToken}`;
      }).catch(error => {
        this.utilityService.errorNotification($localize`:@@groupFiles.errorRetrievingLOOLUrl:Not possible to retrieve the complete Office Online url`);
      });
    return wopiClientURL;
  }

  objectExists(object: any) {
    return this.utilityService.objectExists(object);
  }
}
