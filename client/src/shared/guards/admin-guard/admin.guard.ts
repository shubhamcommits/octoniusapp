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
      const role = this.storageService.getLocalData('userData')['role'].trim();
      let userAdminState = (role === 'member' || role === 'manager') ? false : true;
      if(userAdminState === true)
        return true;
      else{
        this.utilityService.warningNotification($localize`:@@adminGuard.oopsNoPermission:Oops seems like you don\'t have the permission to access the admin section, kindly contact your superior to provide you the proper admin rights!`);
        if(state.url.match('/dashboard/admin/.*'))
          this.router.navigate(['dashboard', 'myspace', 'inbox']);
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
