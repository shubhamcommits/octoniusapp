import { Injectable ,Injector} from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';

@Injectable({
  providedIn: 'root',
})
export class PortfolioGuard   {

  private publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private utilityService: UtilityService,
    private router: Router,
    private injector: Injector,
  ) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    return this.checkUserPortfolio();
  }


  async checkUserPortfolio() {

    const currentPortfolio: any = await this.publicFunctions.getCurrentPortfolioDetails();
    const userData: any = await this.publicFunctions.getCurrentUser();

    const portfolioMembersIndex = currentPortfolio._members.findIndex((member: any) => member._id == userData._id);

    if (portfolioMembersIndex >= 0 || (currentPortfolio?._created_by?._id || currentPortfolio?._created_by) == userData?._id) {
      return true;
    } else {
      this.utilityService.warningNotification($localize`:@@portfolioGuard.oopsNoPermissionForPortfolio:Oops seems like you don\'t have the permission to access the portfolio, kindly contact your superior to provide you the proper access!`);
      this.router.navigate(['/dashboard', 'work', 'groups', 'all'])
      return false;
    }
  }
}
