import { Component, OnChanges, OnDestroy, Output, Input, Injector, EventEmitter } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { BehaviorSubject } from 'rxjs';
import { FilesService } from 'src/shared/services/files-service/files.service';
import { FlamingoService } from 'src/shared/services/flamingo-service/flamingo.service';
import { FoldersService } from 'src/shared/services/folders-service/folders.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-group-new-file',
  templateUrl: './group-new-file.component.html',
  styleUrls: ['./group-new-file.component.scss']
})
export class GroupNewFileComponent implements OnChanges, OnDestroy {

  constructor(
    public Injector: Injector
  ) { }

  // User Data Variable
  @Input('userData') userData: any;

  // GroupId Variable
  @Input('groupId') groupId: any;

  // WorkspaceId Variable
  @Input('workspaceId') workspaceId: any;

  // GroupId Variable
  @Input() folderId: any;

  // Output folder event emitter
  @Output('folder') folderEmitter = new EventEmitter();

  // Output files event emitter
  @Output('file') fileEmitter = new EventEmitter();

  // Property to check if the workspace has the flamingo module available
  flamingoModuleAvailable = false;

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  // Public Functions Instance
  public publicFunctions = this.Injector.get(PublicFunctions);

  // File Data variable
  fileData: any = {
    _group: '',
    _posted_by: '',
    type: 'file'
  }

  async ngOnChanges() {

    const currentWorkspace = await this.publicFunctions.getCurrentWorkspace();
    this.flamingoModuleAvailable = await this.publicFunctions.checkFlamingoStatus(currentWorkspace['_id'], currentWorkspace['management_private_api_key']);

    // Set the File Credentials after view initialization
    this.fileData = {
      _group: this.groupId,
      _folder: this.folderId,
      _posted_by: this.userData._id,
      type: 'file',
      _workspace: this.workspaceId
    }
  }

  ngOnDestroy() {
    this.isLoading$.complete()
  }

  createFolder() {
    // Start the loading spinner
    this.isLoading$.next(true);

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
          });
      }));

    // Stop the loading spinner
    this.isLoading$.next(false);
  }

  /**
   * This function is responsible for uploading the files to the server
   * @param files
   */
  fileInput(files: FileList) {
    // Start the loading spinner
    this.isLoading$.next(true);

    // Loop through each file and begin the process of uploading
    Array.prototype.forEach.call(files, (file: File) => {

      // Adding Mime Type of the file uploaded
      this.fileData.mime_type = file.type

      // Call the Upload file service function
      this.uploadFile(this.fileData, file);

    });

    // Stop the loading spinner
    this.isLoading$.next(false);
  }

  folderUpload(folderInput) {
    // Start the loading spinner
    this.isLoading$.next(true);

    // Files Service Instance
    let folderService = this.Injector.get(FoldersService);

    // Utility Service Instance
    let utilityService = this.Injector.get(UtilityService);

    // Files Service Instance
    let fileService = this.Injector.get(FilesService);

    utilityService.asyncNotification(`Please wait we are uploading the folder...`,
      new Promise(async (resolve, reject) => {
        try {
          let folders = [];
          for (let j = 0; j < folderInput.target.files.length; j++) {
            let file: File = folderInput.target.files[j];

            const relativePath = file['webkitRelativePath'];
            const path = relativePath.split("/");

            for (let i = 0; i < path.length; i++) {
              const name = path[i];

              if (i == (path.length - 1)) {
                // upload the file
                // Set the folder
                const folderIndex = await folders.findIndex(folder => {
                  return folder.folder_name == path[i-1];
                });

                if (folderIndex >= 0) {
                  this.fileData._folder = folders[folderIndex]._id;
                } else {
                  this.fileData._folder = this.folderId;
                }

                // Adding Mime Type of the file uploaded
                this.fileData.mime_type = file.type;

                // Call the Upload file service function
                // this.uploadFile(this.fileData, file);
                await fileService.addFile(this.fileData, file)
                  .catch((err) => {
                    throw (err);
                  });
              } else {
                // create the folder

                // check if the folder was already created
                let folderIndex = await folders.findIndex(folder => {
                  return folder.folder_name == name;
                });

                if (folderIndex < 0) {
                  const folder: any = {
                    folder_name: name,
                    _created_by: this.userData._id,
                    _group: this.groupId,
                  };

                  if (i > 0) {
                    // search for the parent
                    folderIndex = await folders.findIndex(folder => {
                      return folder.folder_name == path[i-1];
                    });
                    folder._parent = folders[folderIndex]._id;
                  } else {
                    folder._parent = this.folderId;
                  }

                  await folderService.add(folder)
                    .then((res) => {
                      folders.push(res['folder']);
                    })
                    .catch((err) => {
                      throw (err);
                    });
                }
              }
            }
          }
          this.folderEmitter.emit(folders[0]);
          resolve(utilityService.resolveAsyncPromise('Folder has been uploaded!'));
        } catch (err) {
          console.log('There\'s some unexpected error occured, please try again!', err);
          reject(utilityService.rejectAsyncPromise('Unexpected error occured while creating the folder, please try again!'));
        }
      }));

    // Stop the loading spinner
    this.isLoading$.next(false);
  }

  /**
   * This function is responsible for creating a folio
   */
  createFolio() {
    // Start the loading spinner
    this.isLoading$.next(true);

    const folio: any = {
      _group: this.groupId,
      _folder: this.folderId,
      _posted_by: this.userData._id,
      type: 'folio',
      mime_type: 'folio'
    }

    this.uploadFile(folio);

    // Stop the loading spinner
    this.isLoading$.next(false);
  }

  /**
  * This function is responsible for creating a flamingo
  */
  createFlamingo(){

    this.isLoading$.next(true);

    const flamingoData: any = {
      _group: this.groupId,
      _folder: this.folderId,
      _posted_by: this.userData._id,
      original_name: 'New Flamingo',
      modified_name:'New Flamingo',
      type: 'flamingo',
      mime_type: 'flamingo'
    }

    this.uploadFile(flamingoData);

    // Stop the loading spinner
    this.isLoading$.next(false);
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

            resolve((file) ? utilityService.resolveAsyncPromise('File has been uploaded!')
              : (fileData.type == 'flamingo' ? utilityService.resolveAsyncPromise('New flamingo has been created!')
                : utilityService.resolveAsyncPromise('New folio has been created!')))

          })
          .catch(() => {
            reject(utilityService.rejectAsyncPromise('Unexpected error occured while uploading, please try again!'))
          })
      }))
  }
}
