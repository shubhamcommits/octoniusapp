import { Injectable ,Injector} from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';
import { StorageService } from 'src/shared/services/storage-service/storage.service';

@Injectable({
  providedIn: 'root',
})
export class GroupGuard   {

  private publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private utilityService: UtilityService,
    private storageService: StorageService,
    private router: Router,
    private injector: Injector,
  ) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    if (state.url.includes('/collection')) {
      return true;
    }

    return this.checkUserGroups() && this.checkGroupAdmins(state);
  }


  async checkUserGroups() {

    const currentGroup: any = await this.publicFunctions.getCurrentGroupDetails();

    let userData = (this.storageService.existData('userData') === null) ? {} : this.storageService.getLocalData('userData');

    if (currentGroup.archived_group) {
      this.utilityService.warningNotification($localize`:@@groupGuard.oopsGroupDoesNotExist:Oops seems like the group don\'t exist!`);
      await this.publicFunctions.sendUpdatesToGroupData({});
      this.router.navigate(['dashboard', 'myspace', 'inbox']);
      return false;
    }

    const groupMembersIndex = (!!currentGroup && !!currentGroup?._members) ? currentGroup?._members.findIndex((member: any) => member._id == userData._id) : -1;
    const groupAdminsIndex = (!!currentGroup && !!currentGroup?._admins) ? currentGroup?._admins.findIndex((admin: any) => admin._id == userData._id) : -1;
    const userGroupsIndex = (!!userData && !!userData._groups) ? userData._groups.findIndex((group: any) => group == currentGroup?._id) : -1;

    if (groupMembersIndex >= 0 || groupAdminsIndex >= 0 || userGroupsIndex >= 0 || userData?._private_group == currentGroup?._id) {
      return true;
    } else {
      this.utilityService.warningNotification($localize`:@@groupGuard.oopsNoPermissionForGroup:Oops seems like you don\'t have the permission to access the group, kindly contact your superior to provide you the proper access!`);
      await this.publicFunctions.sendUpdatesToGroupData({});
      this.router.navigate(['dashboard', 'myspace', 'inbox']);
      return false;
    }
  }

  async checkGroupAdmins(state) {

    let userId = '';

    const currentGroup: any = await this.publicFunctions.getCurrentGroupDetails();

    this.utilityService.currentUserData.subscribe((res) => {
      if(res && JSON.stringify(res) != JSON.stringify({})){
        userId = res['_id'];
      }
    });

    if (currentGroup?._admins?.findIndex((admin: any) => admin._id == userId) < 0 && this.isGroupManagerURL(state)) {
      const newGroup = await this.publicFunctions.getGroupDetails(currentGroup?._id);
      await this.publicFunctions.sendUpdatesToGroupData(newGroup);
      this.utilityService.warningNotification($localize`:@@groupGuard.oopsNoPermissionForSection:Oops seems like you don\'t have the permission to access the section, kindly contact your superior to provide you the proper admin rights!`);
      
      if (currentGroup.type == 'resource') {
        this.router.navigate(['dashboard', 'work', 'groups', 'resource']);
      } else {
        this.router.navigate(['dashboard', 'work', 'groups', 'activity']);
      }
      return false;
    }

    if (state.url.includes('/activity') && currentGroup.type == 'resource') {
      this.router.navigate(['dashboard', 'work', 'groups', 'resource']);
    }

    return true;
  }

  isGroupManagerURL(state): boolean {
    return (state.url.match('/dashboard/work/groups/dashboard*') != null || state.url.match('/dashboard/work/groups/admin*') != null);
  }
}
