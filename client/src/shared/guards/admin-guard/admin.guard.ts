import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, CanLoad, Router, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate, CanActivateChild, CanLoad {

  constructor(
    private storageService: StorageService,
    private utilityService: UtilityService,
    private router: Router
  ){ }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

      const workspaceData = this.storageService.getLocalData('workspaceData');
      const userData = this.storageService.getLocalData('userData');
      const role = (userData['role']) ? userData['role'].trim() : '';
      const allowDecentralizedRoles = workspaceData.allow_decentralized_roles || false;
      if (role == 'owner' || role == 'admin' || role == 'manager' || allowDecentralizedRoles) {
        return true;
      } else {
        this.utilityService.warningNotification($localize`:@@adminGuard.oopsNoPermission:Oops seems like you don\'t have the permission to access the admin section, kindly contact your superior to provide you the proper admin rights!`);
        if (state.url.match('/dashboard/admin/.*')) {
          this.router.navigate(['dashboard', 'myspace', 'inbox']);
        }
        return false;
      }
  }
  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return true;
  }
  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
    return true;
  }
}
