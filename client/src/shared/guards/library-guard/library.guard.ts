import { Injectable ,Injector} from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';
import { LibraryService } from 'src/shared/services/library-service/library.service';
import { StorageService } from 'src/shared/services/storage-service/storage.service';

@Injectable({
  providedIn: 'root',
})
export class LibraryGuard   {

  collectionId: string;
  pageId: string;

  private publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private utilityService: UtilityService,
    private libraryService: LibraryService,
    public storageService: StorageService,
    private router: Router,
    private injector: Injector
  ) {
  }

  async canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    let currentGroup;
    let collectionData: any;
    this.collectionId = next.queryParams['collection'];
    this.pageId = next.queryParams['page'];
    if (this.collectionId) {
      await this.libraryService.getGroupByCollection(this.collectionId).then(res => {
        currentGroup = res['group'];
      }).catch(error => {
        this.router.navigate(['dashboard', 'work', 'groups', 'activity']);
        return false;
      });

      await this.libraryService.getCollection(this.collectionId).then(res => {
        collectionData = res['collection']
      });
    }

    if (!!this.pageId) {
      await this.libraryService.getGroupByPage(this.pageId).then(res => {
        currentGroup = res['group'];
      }).catch(error => {
        this.router.navigate(['dashboard', 'work', 'groups', 'activity']);
        return false;
      });

      await this.libraryService.getCollectionByPage(this.pageId).then(res => {
        collectionData = res['collection']
      }).catch(error => {
        this.router.navigate(['dashboard', 'work', 'groups', 'activity']);
        return false;
      });
    }

    if (this.utilityService.objectExists(currentGroup)) {
      this.publicFunctions.sendUpdatesToGroupData(currentGroup);
    } else {
      if (state.url.includes('library')) {
        currentGroup = await this.publicFunctions.getCurrentGroupDetails();
      }
    }

    if (!this.utilityService.objectExists(currentGroup)) {
      this.utilityService.warningNotification($localize`:@@libraryGuard.oopsGroupDoesNotExist:Oops seems like the group don\'t exist!`);
      await this.publicFunctions.sendUpdatesToGroupData({});
      this.router.navigate(['dashboard', 'myspace', 'inbox']);
      return false;
    }

    if (currentGroup?.archived_group) {
      this.utilityService.warningNotification($localize`:@@libraryGuard.oopsGroupDoesNotExist:Oops seems like the group don\'t exist!`);
      await this.publicFunctions.sendUpdatesToGroupData({});
      this.router.navigate(['dashboard', 'myspace', 'inbox']);
      return false;
    }

    const isAuth = this.storageService.existData('authToken');
    const userCanViewCollection = await this.utilityService.canUserDoCollectionAction(collectionData, currentGroup, 'read', isAuth);
    if (userCanViewCollection) {
      return true;
    } else {
      this.utilityService.warningNotification($localize`:@@libraryGuard.oopsNoPermissionForGroup:Oops seems like you don\'t have the permission to access the group, kindly contact your superior to provide you the proper access!`);
      await this.publicFunctions.sendUpdatesToGroupData({});
      this.router.navigate(['dashboard', 'myspace', 'inbox']);
      return false;
    }
  }
}
