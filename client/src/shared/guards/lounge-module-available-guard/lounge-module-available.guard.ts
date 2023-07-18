import { Injectable, Injector } from '@angular/core';
import { CanActivate, CanActivateChild, CanLoad, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { Observable } from 'rxjs';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Injectable({
  providedIn: 'root'
})
export class LoungeModuleAvailableGuard implements CanActivate, CanActivateChild {

  // PUBLIC FUNCTIONS
  private publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private utilityService: UtilityService,
    private router: Router,
    private injector: Injector
  ){ }

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {

      const isLoungeModuleAvailable = await this.publicFunctions.isLoungeModuleAvailable();

      if (!isLoungeModuleAvailable) {
        this.utilityService.warningNotification($localize`:@@loungeGuard.oopsNoPermission:Oops seems like you don\'t have the permission to access the admin section, kindly contact your superior to provide you the proper admin rights!`);
        this.router.navigate(['/']);
      }
      return isLoungeModuleAvailable;
  }
  
  async canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const isLoungeModuleAvailable = await this.publicFunctions.isLoungeModuleAvailable();

    if (!isLoungeModuleAvailable) {
      this.utilityService.warningNotification($localize`:@@loungeGuard.oopsNoPermission:Oops seems like you don\'t have the permission to access the admin section, kindly contact your superior to provide you the proper admin rights!`);
      this.router.navigate(['/']);
    }
    return isLoungeModuleAvailable;
  }
}
