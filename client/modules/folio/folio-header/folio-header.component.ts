import { Component, OnInit, Injector } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FilesService } from 'src/shared/services/files-service/files.service';
import { Title } from "@angular/platform-browser";

@Component({
  selector: 'app-folio-header',
  templateUrl: './folio-header.component.html',
  styleUrls: ['./folio-header.component.scss']
})
export class FolioHeaderComponent implements OnInit {

  constructor(
    private router: Router,
    private _ActivatedRoute: ActivatedRoute,
    private _Injector: Injector,
    private titleService: Title
  ) { }

  // GroupID Variable
  groupId: any;

  // ReadOnly Variable
  readOnly = true;

  // fileId Variable
  fileId: any;

  // File Data Variable
  file: any

  // Edit Title
  editTitle = false

  // Global File Original Name Varibale
  fileOriginalName: string;

  async ngOnInit() {

    // Set the groupId
    this.groupId = this._ActivatedRoute.snapshot.queryParamMap.get('group')

    // Set the readOnly
    this.readOnly = this._ActivatedRoute.snapshot.queryParamMap.get('readOnly') == 'true' || false

    // Set the fileId variable
    this.fileId = this._ActivatedRoute.snapshot.firstChild.paramMap.get('id')

    // Fetch Files Details
    this.file = await this.getFile(this.fileId)

    // Set the name to keep a track of original_name
    this.fileOriginalName = this.file.original_name

    // Set the White Color of the body
    document.body.style.background = '#ffffff'

    // Change the title of the tab
    this.titleService.setTitle('Octonius | Folio - ' + (this.file.original_name || 'New Folio'));
  }

  /**
   * This function is responsible for taking the user back to their previous locations
   */
  goBackToFiles() {
    const myWorkplace = this._ActivatedRoute.snapshot.queryParamMap.has('myWorkplace') ? this._ActivatedRoute.snapshot.queryParamMap.get('myWorkplace') : false;
    this.router.navigate(
      ['/dashboard', 'work', 'groups', 'files'],
      { queryParams: {
        group: this.groupId,
        folder: this.file?._folder?._id || this.file?._folder,
        myWorkplace: myWorkplace
      }}
    );

    // Change the title of the tab
    this.titleService.setTitle('Octonius');
  }

  /**
   * This function is responsible for fetching a file's details
   * @param fileId
   */
  public async getFile(fileId: any) {
    return new Promise((resolve) => {

      // Files Service
      let fileService = this._Injector.get(FilesService);

      // Fetch the file details
      fileService.getOne(fileId)
        .then((res) => {
          resolve(res['file'])
        })
        .catch(() => {
          resolve({})
        })
    })
  }

  /**
   * This function is responsible for editing a file's details
   * @param fileId
   * @param file
   */
  public async edit(fileId: any, file: any) {
    return new Promise((resolve) => {

      // Files Service
      let fileService = this._Injector.get(FilesService);

      // Edit the file details
      fileService.edit(fileId, file)
        .then((res) => {
          resolve(res['file'])
        })
        .catch(() => {
          resolve({})
        })
    })
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
      this.titleService.setTitle('Octonius | Folio - ' + (this.file.original_name || 'New Folio'));

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

}
