import { Component, OnInit, Injector, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FilesService } from 'src/shared/services/files-service/files.service';
import { Title } from "@angular/platform-browser";
import { PublicFunctions } from 'modules/public.functions';
import { FolioService } from 'src/shared/services/folio-service/folio.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-folio-header',
  templateUrl: './folio-header.component.html',
  styleUrls: ['./folio-header.component.scss']
})
export class FolioHeaderComponent implements OnInit {

  userData;

  uploadedFiles: Array<File> = []

  // GroupData Variable
  groupData: any;

  // ReadOnly Variable
  readOnly = true;

  // fileId Variable
  fileId: any;

  // File Data Variable
  file: any

  // Uploaded Files
  selectedFile: any

  htmlData: any

  // Edit Title
  editTitle = false

  // Global File Original Name Varibale
  fileOriginalName: string;

  // Public functions class member
  publicFunctions = new PublicFunctions(this._Injector);

  constructor(
    private router: Router,
    private _ActivatedRoute: ActivatedRoute,
    private _Injector: Injector,
    private titleService: Title,
    private folioService: FolioService,
    private utilityService: UtilityService
  ) { }

  async ngOnInit() {

    // Set the groupData
    this.groupData = await this.publicFunctions.getCurrentGroupDetails();

    // Set the readOnly
    this.readOnly = this._ActivatedRoute.snapshot.queryParamMap.get('readOnly') == 'true' || false

    this.userData = await this.publicFunctions.getCurrentUser(this.readOnly);

    if (this.userData && JSON.stringify(this.userData) != JSON.stringify({})) {
      // check if the user is part of the group of the folio
      const groupIndex = await this.userData?._groups?.findIndex(group => { return (group._id || group) == this.groupData?._id });
    }

    // Set the fileId variable
    this.fileId = this._ActivatedRoute.snapshot.firstChild.paramMap.get('id');

    // Fetch File Details
    this.file = await this.publicFunctions.getFile(this.fileId);

    let canEdit = (this.file?.approval_flow_launched) ? !this.file?.approval_flow_launched : true;
    this.readOnly = this.readOnly || !canEdit;

    // Set the name to keep a track of original_name
    this.fileOriginalName = this.file.original_name

    // Set the White Color of the body
    document.body.style.background = '#ffffff'

    // Change the title of the tab
    this.titleService.setTitle('Octonius | Folio - ' + (this.file.original_name || $localize`:@@folioHeader.newFolio:New Folio`));
  }

  /**
   * This function is responsible for taking the user back to their previous locations
   */
  async goBackToFiles() {
    const newGroup = await this.publicFunctions.getGroupDetails(this.file?._group?._id || this.file?._group);
    this.publicFunctions.sendUpdatesToGroupData(newGroup);
    this.router.navigate(
      ['/dashboard', 'work', 'groups', 'files'],
      { queryParams: {
        folder: this.file?._folder?._id || this.file?._folder
      }}
    );

    // Change the title of the tab
    this.titleService.setTitle('Octonius');
  }

  /**
   * This function is responsible for editing a file's details
   * @param fileId
   * @param file
   */
  public async edit(fileId: any, file: any) {

    // Utility Service Instance
    let utilityService = this._Injector.get(UtilityService);

    // Files Service
    let fileService = this._Injector.get(FilesService);

    // Call the HTTP Request Asynschronously
    utilityService.asyncNotification(
      $localize`:@@folioHeader.pleaseWaitRenamingFolio:Please wait we are renaming the folio...`,
      new Promise((resolve, reject) => {
        // Edit the file details
        fileService.edit(fileId, file).then((res) => {
            resolve(utilityService.resolveAsyncPromise($localize`:@@folioHeader.folioRenamed:Folio has been renamed!`));
          })
          .catch(() => {
            reject(utilityService.rejectAsyncPromise($localize`:@@folioHeader.unexpectedErrorRenaming:Unexpected error occurred while renaming the folio, please try again!`));
          });
      }));
  }

  enableEdit() {
    if (!this.readOnly) {
      this.editTitle = !this.editTitle;
    }
  }

  /**
   * This function is responsible for handling the changeTitle functionlaity
   * @param event
   */
  async changeTitle(event: any) {

    // KeyCode = 13 - User hits enter
    if (event.keyCode == 13) {

      // Set the edit title to false
      this.editTitle = false

      // Change the title of the tab
      this.titleService.setTitle('Octonius | Folio - ' + (this.file.original_name || $localize`:@@folioHeader.newFolio:New Folio`));

      // Call the HTTP PUT request to change the data on server
      await this.edit(this.fileId, {
        original_name: event.target.value,
        modified_name: event.target.value
      })
    }

    // KeyCode = 27 - User Hits Escape
    else if (event.keyCode == 27) {

      // Set the original_name back to previous state
      this.file.original_name = this.fileOriginalName

      // Only Set the edit title to false
      this.editTitle = false
    }

  }

  ngOnDestroy() {
    // Change the title of the tab
    this.titleService.setTitle('Octonius');
  }

  fileChange(element: any) {
    this.uploadedFiles = element.target.files;
  }

  onFileChanged(event) {
    // Utility Service Instance
    let utilityService = this._Injector.get(UtilityService);

    // Call the HTTP Request Asynschronously
    utilityService.asyncNotification(
      $localize`:@@folioHeader.pleaseWaitTransformingFile:Please wait we are transforming the file...`,
      new Promise((resolve, reject) => {
        this.uploadedFiles = event.target.files;

        let formData = new FormData();
        for (var i = 0; i < this.uploadedFiles.length; i++) {
          formData.append("uploads[]", this.uploadedFiles[i], this.uploadedFiles[i].name);
        }
        this.folioService.uploadFollioDocx(formData).then((res: any) => {
            // Setting follioService Subject for binding content in quill
            this.folioService.setNewFollioValue(res.folio);

            resolve(utilityService.resolveAsyncPromise($localize`:@@folioHeader.newFolioTransformed:New folio has been transformed!`));

          })
          .catch(() => {
            reject(utilityService.rejectAsyncPromise($localize`:@@folioHeader.unexpectedErrorUploading:Unexpected error occurred while uploading, please try again!`))
          });
      }));
  }

  isAdminUser(groupData: any) {
    const index = (groupData && groupData._admins) ? groupData._admins.findIndex((admin: any) => admin._id === this.userData._id) : -1;
    return index >= 0 || this.userData.role == 'owner';
  }
}
