import { Component, Input, Output, ViewEncapsulation, Injector, OnInit, EventEmitter } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { environment } from 'src/environments/environment';
import { LibreofficeService } from 'src/shared/services/libreoffice-service/libreoffice.service';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { ApprovalPDFSignaturesService } from 'src/shared/services/approval-pdf-signatures-service/approval-pdf-signatures.service';
import { FilesService } from 'src/shared/services/files-service/files.service';
import { SubSink } from 'subsink';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-file-versions',
  templateUrl: './file-versions.component.html',
  styleUrls: ['./file-versions.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FileVersionsComponent implements OnInit {

  @Input() fileData;
  @Input() userData;
  @Input() currentGroupId;
  @Input() canEdit;
  @Input() canView;
  @Input() canDelete;

  @Output() newVersionEvent = new EventEmitter();
  @Output() allVersionsDeletedEmitter = new EventEmitter();

  fileVersions;

  groupData;
  workspaceData;

  authToken: string;

  shareDBSocket;

  // Base Url of the files uploads
  filesBaseUrl = environment.UTILITIES_FILES_UPLOADS;

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

  // Subsink Object
  subSink = new SubSink();

  constructor(
    public filesService: FilesService,
    public libreofficeService: LibreofficeService,
    public storageService: StorageService,
    public utilityService: UtilityService,
    public approvalPDFSignaturesService: ApprovalPDFSignaturesService,
    private injector: Injector
  ) { }

  async ngOnInit() {
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    if (!this.currentGroupId) {
      this.groupData = await this.publicFunctions.getCurrentGroupDetails();
      this.currentGroupId = this.groupData?._id;
    }
    this.authToken = `Bearer ${this.storageService.getLocalData('authToken')['token']}`;

    this.filesService.getFileVersions(this.fileData?._id).then(async res => {
      this.fileVersions = res['fileVersions'];
      if (!this.fileVersions) {
        this.fileVersions = [];
      }

      if (this.fileVersions.length == 0) {
        this.fileVersions.unshift(this.fileData);
      }
    });
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subSink.unsubscribe();
  }

  /**
   * This function is used to return the mime type icon based on the extension of the fileName
   * @param fileName - Name of the file to obtain the icon img
   */
  getFileIcon(fileName: string) {
    return "assets/images/" + this.getFileExtension(fileName) + "-file-icon.png";
  }

  getFileExtension(fileName: string) {
    let file = fileName.split(".");
    let fileType = file[file.length-1].toLowerCase();
    if (fileType == 'mp4') {
      fileType = 'mov';
    }
    return fileType;
  }

  isOfficeFile(fileName: string) {
    const officeExtensions = ['ott', 'odm', 'doc', 'docx', 'xls', 'xlsx', 'ods', 'ots', 'odt', 'xst', 'odg', 'otg', 'odp', 'ppt', 'otp', 'pot', 'odf', 'odc', 'odb'];
    const fileExtension = this.getFileExtension(fileName);
    return officeExtensions.includes(fileExtension);
  }

  async openOfficeDoc(fileId: string) {
    // Start the loading spinner
    this.utilityService.updateIsLoadingSpinnerSource(true);

    window.open(await this.getLibreOfficeURL(fileId, this.groupData?._workspace?._id), "_blank");

    this.utilityService.updateIsLoadingSpinnerSource(false);
  }

  async getLibreOfficeURL(fileId: string, workspaceId: string) {
    // wopiClientURL = https://<WOPI client URL>:<port>/browser/<hash>/cool.html?WOPISrc=https://<WOPI host URL>/<...>/wopi/files/<id>
    let wopiClientURL = '';
    await this.libreofficeService.getLibreofficeUrl().then(res => {
        wopiClientURL = res['url'] + 'WOPISrc=' + `${environment.UTILITIES_BASE_API_URL}/libreoffice/wopi/files/${fileId}/${workspaceId}?access_token=${this.authToken}`;
      }).catch(error => {
        this.utilityService.errorNotification($localize`:@@fileVersions.errorRetrievingLOOLUrl:Not possible to retrieve the complete Office Online url`);
      });
    return wopiClientURL;
  }

  /**
   * Call function to delete file or a folder
   * @param itemId
   */
  deleteItem(itemId: string, type: string, fileName: string) {
    // Ask User to remove this file or not
    this.utilityService.getConfirmDialogAlert()
      .then((result) => {
        if (result.value) {
          // Remove the file
          this.utilityService.asyncNotification($localize`:@@fileVersions.pleaseWaitDeleting:Please wait, we are deleting...`, new Promise((resolve, reject) => {
            this.filesService.deleteFile(itemId, fileName, this.groupData?._workspace?._id, type == 'flamingo')
              .then((res) => {

                // Remove the file from the list
                this.fileVersions = this.fileVersions.filter(file => file._id !== itemId);

                if (this.fileVersions.length == 0) {
                  this.allVersionsDeletedEmitter.emit();
                }

                resolve(this.utilityService.resolveAsyncPromise($localize`:@@fileVersions.versionDeleted:Version deleted!`));
              }).catch((err) => {
                reject(this.utilityService.rejectAsyncPromise($localize`:@@fileVersions.unableToDeleteVersion:Unable to delete the version, please try again!`));
              });
          }));
        }
      });
  }

  /**
   * This function is responsible for uploading the files to the server
   * @param files
   */
  fileInput(files: FileList, type?: any) {
    // Start the loading spinner
    this.utilityService.updateIsLoadingSpinnerSource(true);

    // File Data variable
    const fileData: any = {
      _group: this.currentGroupId,
      _posted_by: this.userData?._id,
      type: 'file',
      _parent: this.fileData._id
    }

    // Loop through each file and begin the process of uploading
    Array.prototype.forEach.call(files, (file: File) => {

      // Adding Mime Type of the file uploaded
      fileData.mime_type = file.type

      // Change type of file, if input is a flamingo
      if(type){
        fileData.type = type
      }

      // Call the HTTP Request Asynschronously
      this.utilityService.asyncNotification($localize`:@@fileVersions.pleaseWaitUploadingFile:Please wait we are uploading your new version...`,
        new Promise((resolve, reject) => {
          this.filesService.addFile(fileData, file)
            .then((res) => {
              if (!this.fileVersions) {
                this.fileVersions = [];
              }

              if (this.fileVersions.length == 0) {
                this.fileVersions.unshift(this.fileData);
              }

              this.fileVersions.unshift(res['file']);

              this.newVersionEvent.emit(res['file']);
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@fileVersions.fileUploaded:File has been uploaded!`))
            })
            .catch(() => {
              reject(this.utilityService.rejectAsyncPromise($localize`:@@fileVersions.unexpectedErrorUploading:Unexpected error occurred while uploading, please try again!`))
            })
        }))
    });

    // Stop the loading spinner
    this.utilityService.updateIsLoadingSpinnerSource(false);
  }

  formateDate(date: any) {
    return (date) ? DateTime.fromISO(date).toLocaleString(DateTime.DATETIME_MED) : '';
  }
}
