import { Component, OnChanges, Output, Input, Injector, EventEmitter } from '@angular/core';
import { FilesService } from 'src/shared/services/files-service/files.service';
import { FoldersService } from 'src/shared/services/folders-service/folders.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-group-new-file',
  templateUrl: './group-new-file.component.html',
  styleUrls: ['./group-new-file.component.scss']
})
export class GroupNewFileComponent implements OnChanges {

  constructor(
    public Injector: Injector
  ) { }

  // User Data Variable
  @Input('userData') userData: any;

  // GroupId Variable
  @Input('groupId') groupId: any;

  // GroupId Variable
  @Input() folderId: any;

  // Output folder event emitter
  @Output('folder') folderEmitter = new EventEmitter();

  // Output files event emitter
  @Output('file') fileEmitter = new EventEmitter();

  // File Data variable
  fileData: any = {
    _group: '',
    _posted_by: '',
    type: 'file'
  }

  ngOnChanges() {

    // Set the File Credentials after view initialization
    this.fileData = {
      _group: this.groupId,
      _folder: this.folderId,
      _posted_by: this.userData._id,
      type: 'file'
    }
  }

  createFolder() {
    // Files Service Instance
    let folderService = this.Injector.get(FoldersService);

    // Utility Service Instance
    let utilityService = this.Injector.get(UtilityService);

    const folder: any = {
      folder_name: 'New Folder',
      _created_by: this.userData._id,
      _group: this.groupId,
      _parent: this.folderId
    };

    // Call the HTTP Request Asynschronously
    utilityService.asyncNotification(
      `Please wait we are creating the folder - ${folder['folder_name']} ...`,
      new Promise((resolve, reject) => {
        folderService.add(folder)
          .then((res) => {

            // Output the created file to the top components
            this.folderEmitter.emit(res['folder']);

            resolve(utilityService.resolveAsyncPromise('Folder has been created!'));

          })
          .catch(() => {
            reject(utilityService.rejectAsyncPromise('Unexpected error occured while creating the folder, please try again!'))
          })
      }))
  }

  /**
   * This function is responsible for uploading the files to the server
   * @param files
   */
  fileInput(files: FileList) {

    // Loop through each file and begin the process of uploading
    Array.prototype.forEach.call(files, (file: File) => {

      // Adding Mime Type of the file uploaded
      this.fileData.mime_type = file.type

      // Call the Upload file service function
      this.uploadFile(this.fileData, file);

    })
  }

  /**
   * This function is responsible for creating a folio
   */
  createFolio() {
    const folio: any = {
      _group: this.groupId,
      _folder: this.folderId,
      _posted_by: this.userData._id,
      type: 'folio',
      mime_type: 'folio'
    }

    this.uploadFile(folio);
  }

  /**
   * This function is responsible for uploading a file to the server
   * @param fileData
   * @param file
   */
  uploadFile(fileData: any, file?: File) {

    // Files Service Instance
    let fileService = this.Injector.get(FilesService)

    // Utility Service Instance
    let utilityService = this.Injector.get(UtilityService)

    // Call the HTTP Request Asynschronously
    utilityService.asyncNotification(
      (file) ? `Please wait we are uploading your file - ${file['name']} ...` : `Please wait while we are creating a new folio`,
      new Promise((resolve, reject) => {
        fileService.addFile(fileData, file)
          .then((res) => {

            // Output the created file to the top components
            this.fileEmitter.emit(res['file']);

            resolve((file) ? utilityService.resolveAsyncPromise('File has been uploaded!') :
              utilityService.resolveAsyncPromise('New file has been uploaded!'))

          })
          .catch(() => {
            reject(utilityService.rejectAsyncPromise('Unexpected error occured while uploading, please try again!'))
          })
      }))
  }

}
