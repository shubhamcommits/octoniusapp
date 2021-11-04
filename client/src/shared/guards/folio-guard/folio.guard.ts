import { Injectable, Injector } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  ActivatedRoute,
} from '@angular/router';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
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
    private _ActivatedRoute: ActivatedRoute,
    private groupService: GroupService,
    private utilityService: UtilityService
  ) {

  }

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    const currentGroupId = state.root.queryParamMap.get('group');
    const readOnly = (state.root.queryParamMap.get('readOnly') == 'true') ? true : false;

    let currentGroup;
    await this.groupService.getGroup(currentGroupId).then(res => {
      currentGroup = res['group'];
    });

    if (!currentGroup?.enabled_rights && readOnly) {
      return true;
    }

    let userData = await this.publicFunctions.getCurrentUser();
    const fileId = next['_urlSegment'].segments[1].path;
    let file = await this.publicFunctions.getFile(fileId);

    const canEdit = await this.utilityService.canUserDoFileAction(file, currentGroup, userData, 'edit');
    let canView = false;
    if (!canEdit) {
      const hide = await this.utilityService.canUserDoFileAction(file, currentGroup, userData, 'hide');
      canView = await this.utilityService.canUserDoFileAction(file, currentGroup, userData, 'view') || !hide;
    }

    if (canEdit || canView || currentGroup.share_files) {
      return true;
    } else {
      this.utilityService.warningNotification($localize`:@@folioGuard.oopsNoPermissionForGroup:Oops seems like you don\'t have the permission to access the group, kindly contact your superior to provide you the proper access!`);
      this.router.navigate(['dashboard', 'myspace', 'inbox']);
      return false;
    }
  }
}
