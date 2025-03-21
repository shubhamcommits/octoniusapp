import { Component, OnInit, Injector } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { LibraryService } from 'src/shared/services/library-service/library.service';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/shared/services/user-service/user.service';
import { StorageService } from 'src/shared/services/storage-service/storage.service';

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

  isAuth;
  canEdit: boolean = false;

  isFavoriteCollection: boolean;

  // Public functions class member
  publicFunctions = new PublicFunctions(this._Injector);

  constructor(
    private activatedRoute: ActivatedRoute,
    private _Injector: Injector,
    private utilityService: UtilityService,
    private libraryService: LibraryService,
    public storageService: StorageService,
    private userService: UserService
  ) {
    this.collectionId = this.activatedRoute.snapshot.queryParams['collection'];
  }

  async ngOnInit() {

    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'library'
    });

    await this.libraryService.getCollection(this.collectionId).then(res => {
      this.collectionData = res['collection']
    });

    this.isAuth = this.storageService.existData('authToken');

    if (this.isAuth) {
      // Set the groupData
      this.groupData = await this.publicFunctions.getCurrentGroupDetails();
      this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
      this.userData = await this.publicFunctions.getCurrentUser();
    } else {
      await this.libraryService.getWorkspaceByCollection(this.collectionId).then(res => {
        this.workspaceData = res['workspace'];
      });
    }

    const isAuth = this.storageService.existData('authToken');

    this.canEdit = await this.utilityService.canUserDoCollectionAction(this.collectionData, this.groupData, 'edit', isAuth, this.userData);

    this.isFavoriteCollection = this.checkIsFavoriteCollection();
  }

  checkIsFavoriteCollection() {
    const collectionIndex = (this.userData && this.userData.stats && this.userData.stats.favorite_collections) ? this.userData.stats.favorite_collections.findIndex(collection => (collection._id || collection) == this.collectionData?._id) : -1;
    return collectionIndex >= 0;
  }

  saveFavoriteCollection() {
    this.utilityService.asyncNotification($localize`:@@collectionNavbar.pleaseWaitWeAreSaving:Please wait we are saving the information...`,
      new Promise((resolve, reject) => {
        // Call HTTP Request to change the request
        this.userService.saveFavoriteCollection(this.collectionData?._id, !this.isFavoriteCollection)
          .then((res) => {
            this.isFavoriteCollection = !this.isFavoriteCollection;
            this.userData = res['user'];
            this.publicFunctions.sendUpdatesToUserData(this.userData);
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@collectionNavbar.collectionSavedFavorite:Collection saved as favorite!`));
          })
          .catch(() => {
            reject(this.utilityService.rejectAsyncPromise($localize`:@@collectionNavbar.unableToSaveAsFavorite:Unable to save the collection as favorite, please try again!`))
          });
      }));
  }

  /**
    * This function opens up the task content in a new modal, and takes #content in the ng-template inside HTML layout
    * @param content
    */
  async openDetails(content) {
    if (this.isAuth) {
      // Open Modal
      this.utilityService.openModal(content, {});
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
      await this.utilityService.asyncNotification($localize`:@@collectionNavbar.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
        this.libraryService.editCollection(this.collectionData?._id, { 'name': this.collectionData?.name })
          .then((res) => {
            // Resolve with success
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@collectionNavbar.detailsUpdated:Details updated!`));
          })
          .catch(() => {
            reject(this.utilityService.rejectAsyncPromise($localize`:@@collectionNavbar.unableToUpdateDetails:Unable to update the details, please try again!`));
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
