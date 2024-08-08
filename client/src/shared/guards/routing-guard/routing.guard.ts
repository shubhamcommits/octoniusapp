import { Injectable, Injector } from '@angular/core';
import { Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { Observable } from 'rxjs';
import { StorageService } from 'src/shared/services/storage-service/storage.service';

@Injectable({
  providedIn: 'root'
})
export class RoutingGuard  {

  private publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private injector: Injector,
    private storageService: StorageService,
    private router: Router
  ) { }
  
  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {
      if (!this.storageService.existData('authToken')) {
        return true;
      } else {
        await this.publicFunctions.sendUpdatesToGroupData({});
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
