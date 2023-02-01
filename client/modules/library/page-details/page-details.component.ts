import { Component, OnInit, Injector } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { MatDialog } from '@angular/material/dialog';
import { LibraryService } from 'src/shared/services/library-service/library.service';
import { FilesService } from 'src/shared/services/files-service/files.service';
import { LibreofficeService } from 'src/shared/services/libreoffice-service/libreoffice.service';
import { environment } from 'src/environments/environment';
import { StorageService } from 'src/shared/services/storage-service/storage.service';

@Component({
  selector: 'app-page-details',
  templateUrl: './page-details.component.html',
  styleUrls: ['./page-details.component.scss']
})
export class PageDetailsComponent implements OnInit {

  pageId: string;

  pageData: any;
  pages: any = [];

  userData: any;
  groupData: any;
  workspaceData: any;

  // Quill Data Object
  quillData: any;

  // Content Mentions Variables keeps a track of mentioned members
  _content_mentions: any = [];

  newComment: any;
  showComments: boolean = false;

  canEditPage: boolean = false;

  // File Data variable
  fileData: any = {
    _group: '',
    _posted_by: '',
    type: 'file'
  };

  newPageName = $localize`:@@pageDetails.newPage:New Page`;

  authToken: string;

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
    private libraryService: LibraryService,
    private libreofficeService: LibreofficeService,
    public storageService: StorageService,
    private filesService: FilesService
  ) {
    this.pageId = this.activatedRoute.snapshot.queryParams['page'];

    if (!this.pageId) {
      this._router.navigate(['/dashboard/work/groups/library']).then(() => {
        // Send Updates to router state
        this.publicFunctions.sendUpdatesToRouterState({
          state: 'group'
        });
      });
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

    if (!this.objectExists(this.groupData)) {
      // Fetch the current group data
      this.groupData = await this.publicFunctions.getCurrentGroupDetails();
    }

    if (!this.objectExists(this.workspaceData)) {
      // Fetch the current workspace data
      this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    }

    await this.libraryService.getPage(this.pageId).then(res => {
      this.pageData = res['page']
    });

    await this.initPages();

    // Set the File Credentials after view initialization
    this.fileData = {
      _group: this.groupData?._id,
      _page: this.pageData?._id,
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
    await this.libraryService.getPageByCollection((this.pageData?._collection?._id || this.pageData?._collection)).then(res => {
			this.pages = res['pages'];
		});
  }

  async createPage() {
    await this.utilityService.asyncNotification($localize`:@@pageDetails.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise(async (resolve, reject) => {
      this.libraryService.createPage(this.pageData?._collection, null, this.newPageName).then(res => {
        if (!this.pages) {
          this.pages = [];
        }
        this.pages.push(res['page']);

        // Resolve with success
        resolve(this.utilityService.resolveAsyncPromise($localize`:@@pageDetails.pageCreated:Page created!`));
      })
      .catch(() => {
        reject(this.utilityService.rejectAsyncPromise($localize`:@@pageDetails.unableToCreate:Unable to create the page, please try again!`));
      });
    }));
  }

  savePage() {
    if (this.quillData) {
      this.utilityService.asyncNotification($localize`:@@pageDetails.pleaseWaitWeUpdatePage:Please wait we are updating the page...`,
      new Promise(async (resolve, reject) => {
        const content = JSON.stringify(this.quillData.contents);
        // Call HTTP Request to change the assignee
        this.libraryService.editPage(this.pageData?._id, { 'content': content, '_content_mentions': this._content_mentions }).then(async res => {
            this.pageData = res['page'];
            this.canEditPage = !this.canEditPage;
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@pageDetails.pageUpdated:Page updated`))
          })
          .catch(() => {
            reject(this.utilityService.rejectAsyncPromise($localize`:@@pageDetails.unableToUpdate:Unable to update the page, please try again!`))
          });
      }));
    } else {
      this.canEditPage = !this.canEditPage;
    }
  }

  getQuillData(quillData: any) {
    // Set the quill data object to the quillData output
    this.quillData = quillData

    // Filter the Mention users content and map them into arrays of Ids
    if(this.quillData && this.quillData?.mention){
      this._content_mentions = this.quillData?.mention?.users?.map((user) => user.insert.mention.id);
    }

    // If content mentions has 'all' then only pass 'all' inside the array
    if (this._content_mentions.includes('all'))
      this._content_mentions = ['all']

    // Set the values of the array
    this._content_mentions = Array.from(new Set(this._content_mentions))
  }

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
    this.utilityService.asyncNotification(
      (file) ? $localize`:@@pageDetails.pleaseWaitUploadingFile:Please wait we are uploading your file - ${file['name']} ...` : $localize`:@@pageDetails.pleaseWaitCreatingFolio:Please wait while we are creating a new folio`,
      new Promise((resolve, reject) => {
        this.libraryService.addPageFile(this.pageData?._id, this.workspaceData?._id, (this.pageData?._collection?._id || this.pageData?._collection), fileData, file)
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

  removeFile(fileId: string) {
    // Open the Confirm Dialog to ask for permission
    this.utilityService.getConfirmDialogAlert($localize`:@@pageDetails.areYouSure:Are you sure?`, $localize`:@@storyDetails.byDoingThisFileWillBeDeleted:By doing this the file will be removed!`)
      .then((res) => {
        if (res.value) {

          // Call the HTTP Service function
          this.utilityService.asyncNotification($localize`:@@pageDetails.pleaseWaitWeRemovingFile:Please wait we are removing your file...`, new Promise((resolve, reject) => {
            this.libraryService.removePageFile(fileId, this.workspaceData?._id)
              .then((res) => {
                this.pageData = res['page'];
                resolve(this.utilityService.resolveAsyncPromise($localize`:@@pageDetails.fileRemoved:File Removed!`));
              })
              .catch((err) => {
                reject(this.utilityService.rejectAsyncPromise($localize`:@@pageDetails.unableToRemoveFile:Unable to remove the file at the moment, please try again!`))
              });
          }));
        }
      });
  }

  isOfficeFile(fileName: string) {
    const officeExtensions = ['ott', 'odm', 'doc', 'docx', 'xls', 'xlsx', 'ods', 'ots', 'odt', 'xst', 'odg', 'otg', 'odp', 'ppt', 'otp', 'pot', 'odf', 'odc', 'odb'];
    const fileExtension = this.getFileExtension(fileName);
    return officeExtensions.includes(fileExtension);
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

  canEditAction() {
    this.canEditPage = !this.canEditPage;
  }

  showCommentsAction(action: boolean) {
    this.showComments = action;
  }

  newCommentReceived(comment: any) {
    if (!this.pageData._comments) {
      this.pageData._comments = [];
    }
    this.pageData._comments.unshift(comment);
    this.newComment = comment;
  }

  onRemoveComment(commentId: string) {
    const index = (this.pageData._comments) ? this.pageData._comments.findIndex(c => c._id == commentId) : -1;
    if (index >= 0) {
      this.pageData._comments.splice(index, 1);
    }
  }

  async getFile(file: any) {
    file.canEdit = true;
    file.canView = true;
    file.canDelete = true;
    
    if (!this.pageData._files) {
      this.pageData._files = [];
    }

    this.pageData._files.unshift(file);
  }

  objectExists(object: any) {
    return this.utilityService.objectExists(object);
  }
}
