import { Component, OnInit, Injector, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FilesService } from 'src/shared/services/files-service/files.service';
import { Title } from "@angular/platform-browser";
import { PublicFunctions } from 'modules/public.functions';
import { FolioService } from 'src/shared/services/folio-service/folio.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-office-header',
  templateUrl: './office-header.component.html',
  styleUrls: ['./office-header.component.scss']
})
export class OfficeHeaderComponent implements OnInit {

  userData;

  uploadedFiles: Array<File> = []

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
    private titleService: Title
  ) { }

  async ngOnInit() {

    // Set the readOnly
    this.readOnly = this._ActivatedRoute.snapshot.queryParamMap.get('readOnly') == 'true' || false

    this.userData = await this.publicFunctions.getCurrentUser(this.readOnly);

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
    this.titleService.setTitle('Octonius | ' + this.file.original_name);
  }

  ngOnDestroy() {
    // Change the title of the tab
    this.titleService.setTitle('Octonius');
  }

  /**
   * This function is responsible for taking the user back to their previous locations
   */
  goBackToFiles() {
    this.router.navigate(
      ['/dashboard', 'work', 'groups', 'files'],
      { queryParams: {
        group: this.file._group._id || this.file._group,
        folder: this.file?._folder?._id || this.file?._folder
      }}
    );

    // Change the title of the tab
    this.titleService.setTitle('Octonius');
  }

  isAdminUser(groupData: any) {
    const index = (groupData && groupData._admins) ? groupData._admins.findIndex((admin: any) => admin._id === this.userData._id) : -1;
    return index >= 0 || this.userData.role == 'owner';
  }
}
