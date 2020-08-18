import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { StorageService } from 'src/shared/services/storage-service/storage.service';

@Injectable({
  providedIn: 'root',
})
export class GroupGuard implements CanActivate  {
  constructor(
    private storageService: StorageService,
    private router: Router
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const currentGroup = state.root.queryParamMap.get('group');
    const userData = this.storageService.getLocalData('userData');
    if (userData._groups.includes(currentGroup)) {
        return true;
    } else {
        this.router.navigate(['/dashboard/myspace/tasks']);
        return false;
    }
  }
}
