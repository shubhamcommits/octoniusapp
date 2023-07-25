import { Injectable ,Injector} from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
// import { PublicFunctions } from 'modules/public.functions';
import { ManagementPortalService } from 'src/shared/services/management-portal-service/management-portal.service';

@Injectable({
  providedIn: 'root',
})
export class IndivicualSubscriptionGuard implements CanActivate  {

  // private publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private managementPortalService: ManagementPortalService,
    private utilityService: UtilityService,
    private router: Router
  ) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    return this.checkUserIndivicualSubscription();
  }

  async checkUserIndivicualSubscription() {
    const isIndividualSubscription: any = await this.managementPortalService.checkIsIndividualSubscription();
    if (!isIndividualSubscription) {
      return true;
    } else {
      this.utilityService.warningNotification($localize`:@@individualSubscriptionGuard.oopsNoPermissionForGroups:Oops seems like you don\'t have the permission to access the groups, kindly contact your superior to provide you the proper access!`);
      this.router.navigate(['/'])
      return false;
    }
  }
}
