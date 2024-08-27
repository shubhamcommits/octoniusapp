import { Injectable ,Injector} from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';
import { GroupService } from 'src/shared/services/group-service/group.service';

@Injectable({
  providedIn: 'root',
})
export class GroupPageGuard   {

  private publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private groupService: GroupService,
    private utilityService: UtilityService,
    private injector: Injector,
  ) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    return (state.url.includes('/activity') && this.checkGroupsHasActivityPageActive('activity'))
      ||  (state.url.includes('/tasks') && this.checkGroupsHasActivityPageActive('tasks'))
      ||  (state.url.includes('/crm') && this.checkGroupsHasActivityPageActive('crm'))
      ||  (state.url.includes('/files') && this.checkGroupsHasActivityPageActive('files'))
      ||  (state.url.includes('/library') && this.checkGroupsHasActivityPageActive('library'))
      ||  (state.url.includes('/resource') && this.checkGroupsHasActivityPageActive('resource'))
      ||  (state.url.includes('/dashboard') && this.checkGroupsHasActivityPageActive('dashboard'));
  }


  async checkGroupsHasActivityPageActive(page: string) {
    const currentGroup: any = await this.publicFunctions.getCurrentGroupDetails();
    switch (page) {
      case 'activity':
        if (currentGroup?.pages_to_show && !currentGroup?.pages_to_show?.activity) {
          this.utilityService.warningNotification($localize`:@@groupPageGuard.oopsNoPermissionForSection:Oops seems like you don\'t have the permission to access the section!`);
          this.groupService.navigateToGroup(currentGroup);
          return false;
        }
        return true;
    
      case 'tasks':
        if (currentGroup?.pages_to_show && !currentGroup?.pages_to_show?.tasks) {
          this.utilityService.warningNotification($localize`:@@groupPageGuard.oopsNoPermissionForSection:Oops seems like you don\'t have the permission to access the section!`);
          this.groupService.navigateToGroup(currentGroup);
          return false;
        }
        return true;
    
      case 'crm':
        // if (currentGroup?.pages_to_show && !currentGroup?.pages_to_show?.crm_setup) {
        //   this.utilityService.warningNotification($localize`:@@groupPageGuard.oopsNoPermissionForSection:Oops seems like you don\'t have the permission to access the section!`);
        //   this.groupService.navigateToGroup(currentGroup);
        //   return false;
        // }
        // return true;
        return false;
    
      case 'files':
        if (currentGroup?.pages_to_show && !currentGroup?.pages_to_show?.files) {
          this.utilityService.warningNotification($localize`:@@groupPageGuard.oopsNoPermissionForSection:Oops seems like you don\'t have the permission to access the section!`);
          this.groupService.navigateToGroup(currentGroup);
          return false;
        }
        return true;
    
      case 'library':
        if (currentGroup?.pages_to_show && !currentGroup?.pages_to_show?.library) {
          this.utilityService.warningNotification($localize`:@@groupPageGuard.oopsNoPermissionForSection:Oops seems like you don\'t have the permission to access the section!`);
          this.groupService.navigateToGroup(currentGroup);
          return false;
        }
        return true;
    
      case 'resource':
        if (currentGroup?.pages_to_show && !currentGroup?.pages_to_show?.resource_management) {
          this.utilityService.warningNotification($localize`:@@groupPageGuard.oopsNoPermissionForSection:Oops seems like you don\'t have the permission to access the section!`);
          this.groupService.navigateToGroup(currentGroup);
          return false;
        }
        return true;
    
      case 'dashboard':
        if (currentGroup?.pages_to_show && !currentGroup?.pages_to_show?.dashboard) {
          this.utilityService.warningNotification($localize`:@@groupPageGuard.oopsNoPermissionForSection:Oops seems like you don\'t have the permission to access the section!`);
          this.groupService.navigateToGroup(currentGroup);
          return false;
        }
        return true;
    }

    return true;
  }
}
