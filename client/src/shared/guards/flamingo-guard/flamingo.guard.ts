import { Injectable, Injector } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { PublicFunctions } from 'modules/public.functions';

@Injectable({
  providedIn: 'root',
})
export class FlamingoGuard   {

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector);

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
    // const fileId = next['_urlSegment']?.segments[2].path;
    const urlSegments = next['_routerState'].url.split('/');
    const docIndex = (!!urlSegments) ? urlSegments.findIndex(segment => segment == 'flamingo') : -1;
    let fileId;
    if (docIndex > -1) {
      fileId = urlSegments[docIndex+1];
      const readOnlyIndex = (!!fileId) ? fileId.indexOf('?') : -1;
      if (readOnlyIndex > -1) {
        fileId = fileId.substring(0, readOnlyIndex);
      }
    } else {
      this.utilityService.warningNotification($localize`:@@folioGuard.oopsNoPermissionForGroup:Oops seems like you don\'t have the permission to access the group, kindly contact your superior to provide you the proper access!`);
      await this.publicFunctions.sendUpdatesToGroupData({});
      this.router.navigate(['dashboard', 'myspace', 'inbox']);
      return false;
    }

    // Public Functions Instance
    let publicFunctions = this.injector.get(PublicFunctions);

    // Fetch Files Details
    const flamingo = await publicFunctions.getFlamingo(fileId);

    if (flamingo && flamingo['_file']) {
      const file = flamingo['_file'];
      const flamingoStatus = await publicFunctions.checkFlamingoStatus(file?._group._workspace._id, file?._group._workspace.management_private_api_key);

      if (!flamingoStatus) {
        this.utilityService.warningNotification($localize`:@@flamingoGuard.oopsSubscriptionNoFlamingo:Oops seems like your subscription doesn\´t have Flamingo Module available!`);
        this.router.navigate(['/home']);

        return false;
      } else {
        if (state.url.includes('/answer')) {
          return true;
        }

        const currentUser = await publicFunctions.getCurrentUser();

        let currentGroup: any = await publicFunctions.getCurrentGroupDetails();

        if (!this.utilityService.objectExists(currentGroup)) {
          currentGroup = await publicFunctions.getGroupDetails(file?._group?._id || file?._group);
        }

        const canEdit = await this.utilityService.canUserDoFileAction(file, currentGroup, currentUser, 'edit');
        let canView = false;
        if (!canEdit) {
          const hide = await this.utilityService.canUserDoFileAction(file, currentGroup, currentUser, 'hide');
          canView = await this.utilityService.canUserDoFileAction(file, currentGroup, currentUser, 'view') || !hide;
        }

        if (canEdit || canView || currentUser?._private_group == currentGroup?._id) {
          return true;
        } else {
          this.utilityService.warningNotification($localize`:@@flamingoGuard.oopsNoPermissionForGroup:Oops seems like you don\'t have the permission to access the group, kindly contact your superior to provide you the proper access!`);
          await this.publicFunctions.sendUpdatesToGroupData({});
          this.router.navigate(['dashboard', 'myspace', 'inbox']);
          return false;
        }
      }
    } else {
      this.utilityService.warningNotification($localize`:@@flamingoGuard.oopsFlamingoDoesNotExists:Oops seems like the Flamingo doesn\'t exists!`);
    }
  }
}
