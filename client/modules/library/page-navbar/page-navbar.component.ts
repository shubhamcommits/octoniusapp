import { Component, OnInit, Injector } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { LibraryService } from 'src/shared/services/library-service/library.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-page-navbar',
  templateUrl: './page-navbar.component.html',
  styleUrls: ['./page-navbar.component.scss']
})
export class PageNavbarComponent implements OnInit {

  pageId: string;

  userData: any;
  groupData: any;
  pageData: any;
  workspaceData: any;
  
  // Edit Title
  editTitle = false

  // Public functions class member
  publicFunctions = new PublicFunctions(this._Injector);

  constructor(
    private activatedRoute: ActivatedRoute,
    private _Injector: Injector,
    private utilityService: UtilityService,
    private libraryService: LibraryService
  ) {
    this.pageId = this.activatedRoute.snapshot.queryParams['page'];
  }

  async ngOnInit() {
    // Set the groupData
    this.groupData = await this.publicFunctions.getCurrentGroupDetails();
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'collection'
    });

    await this.libraryService.getPage(this.pageId).then(res => {
      this.pageData = res['page']
    });
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

      const newTitle = event.target.value;
      if (newTitle !== this.pageData?.name) {
        this.pageData.name = newTitle;
        await this.utilityService.asyncNotification($localize`:@@pageHeader.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
            this.libraryService.editPage(this.pageData?._id, { 'name': this.pageData?.name })
              .then((res) => {
                // Resolve with success
                resolve(this.utilityService.resolveAsyncPromise($localize`:@@pageHeader.detailsUpdated:Details updated!`));
              })
              .catch(() => {
                reject(this.utilityService.rejectAsyncPromise($localize`:@@pageHeader.unableToUpdateDetails:Unable to update the details, please try again!`));
              });
          }));

        this.editTitle = !this.editTitle;
      }
    } else if (event.keyCode == 27) {
      // Only Set the edit title to false
      this.editTitle = false
    }

  }

  ngOnDestroy() {
    // Change the title of the tab
    // this.titleService.setTitle('Octonius');
  }

  isAdminUser(groupData: any) {
    const index = (groupData && groupData._admins) ? groupData._admins.findIndex((admin: any) => admin._id === this.userData._id) : -1;
    return index >= 0 || this.userData.role == 'owner';
  }
}
