import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { StorageService } from 'src/shared/services/storage-service/storage.service';

@Injectable({
  providedIn: 'root',
})
export class FolioGuard implements CanActivate  {

  constructor(
    private groupService: GroupService,
    private utilityService: UtilityService,
    private storageService: StorageService,
    private router: Router
  ) {

  }

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    const currentGroupId = state.root.queryParamMap.get('group');
    const readOnly = (state.root.queryParamMap.get('readOnly') == 'true') ? true : false;

    if (readOnly) {
      return true;
    }

    let userData = (this.storageService.existData('userData') === null) ? {} : this.storageService.getLocalData('userData');

    let currentGroup;
    await this.groupService.getGroup(currentGroupId).then(res => {
      currentGroup = res['group'];
    });

    const groupMembersIndex = currentGroup._members.findIndex((member: any) => member._id == userData._id);
    const groupAdminsIndex = currentGroup._admins.findIndex((admin: any) => admin._id == userData._id);
    const userGroupsIndex = userData._groups.findIndex((group: any) => group == currentGroupId);

    if (groupMembersIndex >= 0 || groupAdminsIndex >= 0
        || userGroupsIndex >= 0 || userData._private_group == currentGroupId
        || currentGroup.share_files) {
      return true;
    } else {
      this.utilityService.warningNotification('Oops seems like you don\'t have the permission to access the group, kindly contact your superior to provide you the proper access!');
      this.router.navigate(['dashboard', 'myspace', 'inbox']);
      return false;
    }
  }
}
