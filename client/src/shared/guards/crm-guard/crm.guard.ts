import { Injectable, Injector } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from "@angular/router";
import { PublicFunctions } from "modules/public.functions";
import { UtilityService } from "src/shared/services/utility-service/utility.service";

@Injectable({
  providedIn: "root",
})
export class CRMGuard {
  private publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private injector: Injector,
    private utilityService: UtilityService,
    private router: Router
  ) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.checkCanUserOpenCRM();
  }

  async checkCanUserOpenCRM() {
    const userData: any = await this.publicFunctions.getCurrentUser();
    const role = userData?.role ? userData?.role?.trim() : "";
    if (userData?.crm_role == true /* || role == 'owner'*/) {
      return true;
    } else {
      this.router.navigate(["dashboard", "work", "groups", "all"]);
      return false;
    }
  }
}
