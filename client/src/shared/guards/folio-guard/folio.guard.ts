import { Injectable, Injector } from '@angular/core';
import { Location } from '@angular/common';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { PublicFunctions } from 'modules/public.functions';

@Injectable({
  providedIn: 'root',
})
export class FolioGuard implements CanActivate  {

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private injector: Injector,
    private router: Router,
    private groupService: GroupService,
    private utilityService: UtilityService,
    private location: Location
  ) {

  }

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    const readOnly = (state.root.queryParamMap.get('readOnly') == 'true') ? true : false;

    // Public Functions Instance
    let publicFunctions = this.injector.get(PublicFunctions);

    let userData = await this.publicFunctions.getCurrentUser();
    const fileId = next['_urlSegment'].segments[1].path;
    let file: any = await this.publicFunctions.getFile(fileId);

    let currentGroup: any = await publicFunctions.getCurrentGroupDetails();

    if (!this.utilityService.objectExists(currentGroup)) {
      currentGroup = await publicFunctions.getGroupDetails(file?._group?._id || file?._group);
    }

    if (!currentGroup?.enabled_rights && readOnly) {
      return true;
    }

    const isAdmin = await this.isAdminUser(currentGroup, userData);

    let canEdit = await this.utilityService.canUserDoFileAction(file, currentGroup, userData, 'edit') && (!currentGroup?.files_for_admins || isAdmin);
    let canView = false;
    if (!canEdit) {
      const hide = await this.utilityService.canUserDoFileAction(file, currentGroup, userData, 'hide');
      canView = await this.utilityService.canUserDoFileAction(file, currentGroup, userData, 'view') || !hide;
    }

    if (canEdit || canView || currentGroup.share_files) {
      return true;
    } else {
      this.utilityService.warningNotification($localize`:@@folioGuard.oopsNoPermissionForGroup:Oops seems like you don\'t have the permission to access the group, kindly contact your superior to provide you the proper access!`);
      await this.publicFunctions.sendUpdatesToGroupData({});
      this.router.navigate(['dashboard', 'myspace', 'inbox']);
      return false;
    }
  }

  isAdminUser(groupData: any, userData: any) {
    const index = (groupData && groupData._admins) ? groupData._admins.findIndex((admin: any) => admin._id === userData._id) : -1;
    return index >= 0 || userData.role == 'owner';
  }
}
