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
    return this.checkUserGroups(currentGroup);
  }

  checkUserGroups(currentGroup): Observable<boolean> {
    return this.userService.getUser().pipe(map((res) => {
      if ((res.user._groups !== undefined && res.user._groups.includes(currentGroup)) ||
          (res.user._private_groups !== undefined && res.user._private_groups.includes(currentGroup))) {
          return true;
      } else {
          this.router.navigate(['dashboard', 'myspace', 'inbox']);
          return false;
      }
    }));
  }
}
