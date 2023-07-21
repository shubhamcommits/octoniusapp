import {Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { ManagementPortalService } from 'src/shared/services/management-portal-service/management-portal.service';

@Injectable({
  providedIn: 'root',
})
export class ActivateInboxGuard implements CanActivate {

  constructor(
    private managementPortalService: ManagementPortalService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return this.checkUserIndivicualSubscription();
  }

  async checkUserIndivicualSubscription() {
    const isIndividualSubscription: any = await this.managementPortalService.checkIsIndividualSubscription();
    if (!isIndividualSubscription) {
      return true;
    } else {
      this.router.navigate(['dashboard', 'myspace', 'tasks'])
      return false;
    }
  }
}
