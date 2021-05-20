import { Injectable, Injector } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  ActivatedRoute
} from '@angular/router';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { PublicFunctions } from 'modules/public.functions';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { FlamingoService } from 'src/shared/services/flamingo-service/flamingo.service';
import { FilesService } from 'src/shared/services/files-service/files.service';

@Injectable({
  providedIn: 'root',
})
export class FlamingoGuard implements CanActivate  {

  constructor(
    private groupService: GroupService,
    private utilityService: UtilityService,
    private injector: Injector,
    private router: Router
  ) {

  }

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {

    const currentGroupId = state.root.queryParamMap.get('group');
    const fileId = next['_urlSegment']?.segments[2].path;

    // Fetch Files Details
    const flamingo = await this.getFile(fileId);

    // Public Functions Instance
    let publicFunctions = this.injector.get(PublicFunctions);

    const flamingoStatus = await publicFunctions.checkFlamingoStatus(flamingo['_file']._group._workspace._id, flamingo['_file']._group._workspace.management_private_api_key);

    if (!flamingoStatus) {
      this.utilityService.warningNotification('Oops seems like your subscription doesn\´t have Flamingo Module available!');
      this.router.navigate(['/home']);

      return false;
    } else {
      if (state.url.includes('/answer')) {
        return true;
      }

      const currentUser = await publicFunctions.getCurrentUser();

      let currentGroup;
      await this.groupService.getGroup(currentGroupId).then(res => {
        currentGroup = res['group'];
      });
      const groupMembersIndex = currentGroup._members.findIndex((member: any) => member._id == currentUser._id);
      const groupAdminsIndex = currentGroup._admins.findIndex((admin: any) => admin._id == currentUser._id);
      const userGroupsIndex = currentUser._groups.findIndex((group: any) => group == currentGroupId);

      if (groupMembersIndex >= 0 || groupAdminsIndex >= 0
          || userGroupsIndex >= 0 || currentUser._private_group == currentGroupId) {
        return true;
      } else {
        this.utilityService.warningNotification('Oops seems like you don\'t have the permission to access the group, kindly contact your superior to provide you the proper access!');
        this.router.navigate(['dashboard', 'myspace', 'inbox']);
        return false;
      }
    }
  }

  /**
  * This function is responsible for fetching a flamingo's details
  * @param fileId
  */
  public async getFile(fileId: any) {
    return new Promise((resolve) => {

      // Flamingo Service
      let flamingoService = this.injector.get(FlamingoService);

      // Fetch the Flamingo details
      flamingoService.getOne(fileId)
        .then((res) => {
          resolve(res['flamingo'])
        })
        .catch(() => {
          resolve({})
        })
    })
  }
}
