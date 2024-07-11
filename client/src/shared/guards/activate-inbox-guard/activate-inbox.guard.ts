import {Injectable, Injector } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ActivateInboxGuard  {

  private publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private injector: Injector,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return this.checkUserIndivicualSubscription();
  }

  async checkUserIndivicualSubscription() {
    const isIndividualSubscription: any = await this.publicFunctions.checkIsIndividualSubscription();
    if (!isIndividualSubscription) {
      return true;
    } else {
      this.router.navigate(['dashboard', 'myspace', 'tasks'])
      return false;
    }
  }
}
