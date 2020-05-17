import { Component, OnInit, Output, Input, Injector, EventEmitter } from '@angular/core';
import { FilesService } from 'src/shared/services/files-service/files.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-group-new-file',
  templateUrl: './group-new-file.component.html',
  styleUrls: ['./group-new-file.component.scss']
})
export class GroupNewFileComponent implements OnInit {

  constructor(
    public Injector: Injector
  ) { }

  // User Data Variable
  @Input('userData') userData: any;

  // GroupId Variable
  @Input('groupId') groupId: any;

  // File Data variable
  file = {
    _group: '',
    _posted_by: ''
  }

  // Output folder event emitter
  @Output('folder') folderEmitter = new EventEmitter();

  // Output files event emitter
  @Output('file') fileEmitter = new EventEmitter();

  ngOnInit() {
  }

  ngAfterViewInit() {

    // Set the File Credentials after view initialization
    this.file = {
      _group: this.groupId,
      _posted_by: this.userData._id
    }
  }

  createFolder(folder: any) {

  }

  /**
   * This function is responsible for uploading the files to the server
   * @param files 
   */
  fileInput(files: FileList) {

    // Loop through each file and begin the process of uploading
    Array.prototype.forEach.call(files, (file: File) => {

      // Call the Upload file service function
      this.uploadFile(this.file, file);

    })
  }

  /**
   * This function is responsible for uploading a file to the server
   * @param fileData 
   * @param file 
   */
  uploadFile(fileData: any, file: File) {

    // Files Service Instance
    let fileService = this.Injector.get(FilesService)

    // Utility Service Instance
    let utilityService = this.Injector.get(UtilityService)

    // Call the HTTP Request Asynschronously
    utilityService.asyncNotification(`Please wait we are uploading your file - ${file['name']} ...`, new Promise((resolve, reject) => {
      fileService.addFile(fileData, file)
        .then((res) => {

          // Output the created file to the top components
          this.fileEmitter.emit(res['file']);

          resolve(utilityService.resolveAsyncPromise('File has been uploaded!'))
        })
        .catch(() => {
          reject(utilityService.rejectAsyncPromise('Unexpected error occured while uploading, please try again!'))
        })
    }))
  }

}
