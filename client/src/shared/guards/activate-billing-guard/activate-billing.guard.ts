import {Injectable, Injector, } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanDeactivate, Router, UrlTree, CanActivateChild} from '@angular/router';
import { Observable } from 'rxjs';
import { PublicFunctions } from 'modules/public.functions';
import { ManagementPortalService } from 'src/shared/services/management-portal-service/management-portal.service';

@Injectable()
export class ActivateBillingGuard implements CanActivate {

  // PUBLIC FUNCTIONS
  private publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private injector: Injector,
    private managementPortalService: ManagementPortalService,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return this.checkBillingStatus();
  }

  async checkBillingStatus() {
    if (localStorage.length > 0) {
      const currentWorkspace = await this.publicFunctions.getCurrentWorkspace();
      return this.managementPortalService.canActivateBilling(currentWorkspace['_id'], currentWorkspace['management_private_api_key']).then(
        (res) => {
          if ( !res['status'] ) {
            return false;
          }
          return true;
        }).catch((err) => {
          return false;
        });
    } else {
      return false;
    }
  }
}
