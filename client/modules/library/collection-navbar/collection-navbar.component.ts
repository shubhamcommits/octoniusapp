import { Component, OnInit, Injector } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { LibraryService } from 'src/shared/services/library-service/library.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-collection-navbar',
  templateUrl: './collection-navbar.component.html',
  styleUrls: ['./collection-navbar.component.scss']
})
export class CollectionNavbarComponent implements OnInit {

  collectionId: string;

  userData: any;
  groupData: any;
  collectionData: any;
  workspaceData: any;
  
  // Edit Title
  editTitle = false

  canEdit = false;

  // Public functions class member
  publicFunctions = new PublicFunctions(this._Injector);

  constructor(
    private activatedRoute: ActivatedRoute,
    private _Injector: Injector,
    private utilityService: UtilityService,
    private libraryService: LibraryService
  ) {
    this.collectionId = this.activatedRoute.snapshot.queryParams['collection'];
  }

  async ngOnInit() {
    // Set the groupData
    this.groupData = await this.publicFunctions.getCurrentGroupDetails();
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'library'
    });

    await this.libraryService.getCollection(this.collectionId).then(res => {
      this.collectionData = res['collection']
    });

    this.canEdit = await this.utilityService.canUserDoCollectionAction(this.collectionData, this.groupData, this.userData, 'edit');
  }

  /**
    * This function opens up the task content in a new modal, and takes #content in the ng-template inside HTML layout
    * @param content
    */
  async openDetails(content) {
    // Open Modal
    this.utilityService.openModal(content, {});
  }

  /**
   * This function is responsible for handling the changeTitle functionlaity
   * @param event
   */
  async changeTitle(event: any) {

    // KeyCode = 13 - User hits enter
    if (event.keyCode == 13) {

      // Set the edit title to false
      await this.utilityService.asyncNotification($localize`:@@collectionHeader.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
        this.libraryService.editCollection(this.collectionData?._id, { 'name': this.collectionData?.name })
          .then((res) => {
            // Resolve with success
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@collectionHeader.detailsUpdated:Details updated!`));
          })
          .catch(() => {
            reject(this.utilityService.rejectAsyncPromise($localize`:@@collectionHeader.unableToUpdateDetails:Unable to update the details, please try again!`));
          });
      }));

      this.editTitle = !this.editTitle;
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
