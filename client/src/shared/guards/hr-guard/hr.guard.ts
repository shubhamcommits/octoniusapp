import { Injectable, Injector } from "@angular/core";
import {
  Router,
  Route,
  UrlSegment,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from "@angular/router";
import { PublicFunctions } from "modules/public.functions";
import { Observable } from "rxjs/internal/Observable";
import { UtilityService } from "src/shared/services/utility-service/utility.service";

@Injectable({
  providedIn: "root",
})
export class HRGuard {
  private publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private injector: Injector,
    private utilityService: UtilityService,
    private router: Router
  ) {}

  async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const userData: any = await this.publicFunctions.getCurrentUser();
    const role = userData?.role ? userData?.role?.trim() : "";
    if (!!userData?.hr_role /* || role == 'owner'*/) {
      return true;
    } else {
      this.utilityService.warningNotification(
        $localize`:@@hrGuard.oopsNoPermission:Oops seems like you don\'t have the permission to access the HR section, kindly contact your superior to provide you the proper admin rights!`
      );
      await this.publicFunctions.sendUpdatesToGroupData({});
      this.router.navigate(["dashboard", "myspace", "inbox"]);
      return false;
    }
  }

  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return true;
  }

  canLoad(
    route: Route,
    segments: UrlSegment[]
  ): Observable<boolean> | Promise<boolean> | boolean {
    return true;
  }
}
