import {Injectable, Injector, } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
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
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      // return false;
      // Disabling the stripe integration for now, we are handling the payments and blocking the workspace manualy
      return this.checkBillingStatus() && this.isAdminUser();
  }

  async checkBillingStatus() {
    const currentWorkspace = await this.publicFunctions.getCurrentWorkspace();

    return this.managementPortalService.canActivateBilling(currentWorkspace['_id'], currentWorkspace['management_private_api_key']).subscribe(
      (res) => {
        if ( !res['status'] ) {
          this.router.navigate(['/home']);
        }
        return res['status'];
      });
  }

  async isAdminUser() {
    const currentUser = await this.publicFunctions.getCurrentUser();
    let userAdminState = (currentUser.role === 'member' || currentUser.role === 'guest') ? false : true;
    let adminUser = false;
    if (userAdminState) {
      adminUser = true;
    }
    return adminUser;
  }
}
