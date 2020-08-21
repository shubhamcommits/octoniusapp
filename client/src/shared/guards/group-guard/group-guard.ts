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

@Injectable({
  providedIn: 'root',
})
export class GroupGuard implements CanActivate  {
  constructor(
    private storageService: StorageService,
    private userService: UserService,
    private router: Router
  ) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const currentGroup = state.root.queryParamMap.get('group');
    const myWorkplace = state.root.queryParamMap.get('myWorkplace');
    return this.checkUserGroups(currentGroup, myWorkplace);
  }

  checkUserGroups(currentGroup, myWorkplace): Observable<boolean> {
    return this.userService.getUser().pipe(map((res) => {
      if (myWorkplace === true) {
        return true;
      }
      if (res.user._groups.includes(currentGroup) || res.user._private_group.includes(currentGroup)) {
          return true;
      } else {
          this.router.navigate(['dashboard', 'myspace', 'inbox']);
          return false;
      }
    }));
  }
}
