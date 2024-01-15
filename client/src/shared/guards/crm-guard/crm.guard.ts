import { Injectable ,Injector} from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';

@Injectable({
  providedIn: 'root',
})
export class CRMGuard implements CanActivate  {

  private publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private injector: Injector
  ) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) {
    return this.checkIsCRMGroup();
  }

  async checkIsCRMGroup() {
    const currentGroup: any = await this.publicFunctions.getCurrentGroupDetails();
    return !!currentGroup && !!currentGroup.type && currentGroup.type == 'crm';
  }
}
