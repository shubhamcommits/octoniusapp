import { Injectable, Injector } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { UserService } from 'src/shared/services/user-service/user.service';
import { map } from 'rxjs/operators';
import { MyspaceWorkplaceComponent } from 'modules/myspace/myspace-workplace/myspace-workplace.component';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { GroupService } from 'src/shared/services/group-service/group.service';

@Injectable({
  providedIn: 'root',
})
export class GroupGuard implements CanActivate  {

  groupAdmins;

  constructor(
    private groupService: GroupService,
    private userService: UserService,
    private utilityService: UtilityService,
    private router: Router
  ) {

  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const currentGroup = state.root.queryParamMap.get('group');
    const myWorkplace = state.root.queryParamMap.get('myWorkplace');

    return this.checkUserGroups(currentGroup, myWorkplace, state) && this.checkGroupAdmins(currentGroup, state);
  }

  checkUserGroups(currentGroup, myWorkplace, state): Observable<boolean> {
    return this.userService.getUser().pipe(map((res) => {
      if (res.user._groups.includes(currentGroup) || res.user._private_group.includes(currentGroup)) {


        return true;
      } else {
        this.router.navigate(['dashboard', 'myspace', 'inbox']);
        return false;
      }
    }));
  }

  checkGroupAdmins(currentGroup, state): Observable<boolean> {

    let userId = '';

    this.utilityService.currentUserData.subscribe((res) => {
      if(JSON.stringify(res) != JSON.stringify({})){
        userId = res['_id'];
      }
    });

    return this.groupService.getGroupObservale(currentGroup).pipe(map((res) => {

      if (res['group']['_admins'].findIndex((admin: any) => admin._id === userId) < 0 && this.isGroupManagerURL(state)) {
        this.utilityService.warningNotification('Oops seems like you don\'t have the permission to access the section, kindly contact your superior to provide you the proper admin rights!', '', {
          showProgressBar: true,
          closeOnClick: true,
          backdrop: 0.8,
          timeout: 3000
        });

        this.router.navigate(['dashboard', 'myspace', 'inbox']);

        return false;
      }
      return true;
    }))
  }

  isGroupManagerURL(state): boolean {
    return (state.url.match('/dashboard/work/groups/dashboard*') != null || state.url.match('/dashboard/work/groups/admin*') != null);
  }
}
